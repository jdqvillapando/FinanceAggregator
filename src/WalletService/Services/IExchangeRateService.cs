namespace WalletService.Services;

public interface IExchangeRateService
{
    Task<Dictionary<string, decimal>?> GetUsdExchangeRatesAsync(CancellationToken cancellationToken = default);
}