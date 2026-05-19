namespace WalletService.Contracts;

public record TransactionExecuted
{
    public Guid TransactionId { get; init; }
    public Guid WalletId { get; init; }
    public Guid AssetId { get; init; }
    public string Ticker { get; init; } = string.Empty;
    public decimal Amount { get; init; } // Will hold a positive or negative value depending on the operation
    public string Type { get; init; } = string.Empty; // "Deposit" or "Withdrawal"
    public string Description { get; init; } = string.Empty;
    public DateTime Timestamp { get; init; }
}