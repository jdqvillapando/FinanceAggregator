using System.Text.Json;
using Microsoft.Extensions.Caching.Distributed;
using WalletService.Dtos;


namespace WalletService.Services;

public class ExchangeRateService : IExchangeRateService
{
    private readonly HttpClient _httpClient;
    private readonly IDistributedCache _cache;
    private readonly ILogger<ExchangeRateService> _logger;
    private const string CacheKey = "usd_exchange_rates";

    public ExchangeRateService(HttpClient httpClient, IDistributedCache cache, ILogger<ExchangeRateService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Dictionary<string, decimal>?> GetUsdExchangeRatesAsync(CancellationToken cancellationToken = default)
    {
        // Check Redis Cache
        try
        {
            var cachedRatesJson = await _cache.GetStringAsync(CacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cachedRatesJson))
            {
                _logger.LogInformation("USD Exchange rates retrieved from Redis cache.");
                return JsonSerializer.Deserialize<Dictionary<string, decimal>>(cachedRatesJson);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read exchange rates from Redis cache. Proceeding to external API fetch.");
        }

        // Fetch from Frankfurter API v2 (Array response)
        try
        {
            var response = await _httpClient.GetAsync("https://api.frankfurter.dev/v2/rates?base=USD", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Frankfurter API v2 returned status code {StatusCode}.", response.StatusCode);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var quotes = JsonSerializer.Deserialize<List<ExchangeRateResponseDto>>(json);

            if (quotes == null || quotes.Count == 0)
            {
                return null;
            }

            // Transform array into dictionary map: Key = Quote ticker (e.g., "ADA"), Value = Rate
            var rates = quotes
                .Where(q => !string.IsNullOrEmpty(q.Quote))
                .ToDictionary(
                    q => q.Quote.ToUpperInvariant(),
                    q => q.Rate,
                    StringComparer.OrdinalIgnoreCase
                );

            // Establish USD baseline (1 USD = 1.0 USD)
            rates["USD"] = 1.0m;

            // Store mapped dictionary in Redis Cache (12 Hours)
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12)
                };
                await _cache.SetStringAsync(CacheKey, JsonSerializer.Serialize(rates), options, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to cache USD exchange rates in Redis.");
            }

            return rates;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception encountered while fetching exchange rates from Frankfurter API v2.");
            return null;
        }
    }
}