namespace NotificationService.Contracts;

// Define the matching event contract interface structure
public interface TransactionExecuted
    {
        Guid TransactionId { get; }
        string WalletId { get; }
        decimal Amount { get; }
        string TransactionType { get; }
        DateTime Timestamp { get; }
    }