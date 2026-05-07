using MassTransit;
using NotificationService.Contracts;


namespace NotificationService.Consumers;

public class AssetDeletedConsumer : IConsumer<AssetDeleted>
{
    private readonly ILogger<AssetDeletedConsumer> _logger;

    public AssetDeletedConsumer(ILogger<AssetDeletedConsumer> logger)
    {
        _logger = logger;
    }

    public Task Consume(ConsumeContext<AssetDeleted> context)
    {
        var msg = context.Message;
        _logger.LogWarning("[NOTIFICATION SERVICE] Asset Deleted: Ticker {Ticker} removed from Wallet {WalletId} for User {UserId} at {DeletedAt}", 
            msg.Ticker, msg.WalletId, msg.UserId, msg.DeletedAt);
            
        return Task.CompletedTask;
    }
}