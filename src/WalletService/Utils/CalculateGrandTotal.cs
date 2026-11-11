using WalletService.Dtos;
using WalletService.Models;


namespace WalletService.Utils;

public static class CalculateGrandTotal
{
    public static GrandTotalDto CalculateWalletGT(IEnumerable<Asset> assets, Dictionary<string, decimal>? rates)
    {
        // API or Cache Failure Guard
        if (rates == null || rates.Count == 0)
        {
            return new GrandTotalDto
            {
                GrandTotalUsd = 0m,
                ExcludedTickers = new List<string>(),
                IsAvailable = false
            };
        }

        decimal grandTotal = 0m;
        var excludedSet = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        // Iterate User Assets and Match Rates
        foreach (var asset in assets)
        {
            if (string.IsNullOrWhiteSpace(asset.Ticker))
                continue;

            var ticker = asset.Ticker.Trim().ToUpperInvariant();

            if (ticker == "USD")
            {
                grandTotal += asset.Balance;
            }
            else if (rates.TryGetValue(ticker, out var rateToUsd) && rateToUsd > 0)
            {
                // Frankfurter v2 rate format with base=USD represents 1 USD = X Currency.
                // Converted USD Value = Asset Balance / Exchange Rate
                grandTotal += asset.Balance / rateToUsd;
            }
            else
            {
                // Asset currency has no equivalent exchange rate -> Add to exclusion list
                excludedSet.Add(ticker);
            }
        }

        return new GrandTotalDto
        {
            GrandTotalUsd = Math.Round(grandTotal, 2),
            ExcludedTickers = excludedSet.ToList(),
            IsAvailable = true
        };
    }
}