namespace WalletService.Models;

public enum TransactionType { Deposit, Withdrawal, Transfer }

public class Transaction
{
    public Guid Id { get; set; }
    public Guid AssetId { get; set; }
    public decimal Amount { get; set; }
    public TransactionType Type { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public string Description { get; set; } = string.Empty;

    // Navigation Property
    public Asset Asset { get; set; } = null!;
}