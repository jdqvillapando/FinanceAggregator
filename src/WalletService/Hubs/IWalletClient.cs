namespace WalletService.Hubs;

public interface IWalletClient
{
    // The target method name our React frontend listener will hook into
    Task BalanceUpdated(Guid assetId, decimal newBalance);
}