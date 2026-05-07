namespace NotificationService.Contracts;

public interface AssetDeleted
{
    Guid WalletId { get; }
    string Ticker { get; }
    string UserId { get; }
    DateTime DeletedAt { get; }
}