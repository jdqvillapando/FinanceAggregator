using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using MassTransit;
using WalletService.Contracts;
using WalletService.Data;
using WalletService.Hubs;

namespace WalletService.Consumers;

public class TransactionExecutedConsumer : IConsumer<TransactionExecuted>
{
    private readonly WalletDbContext _context;
    private IHubContext<WalletHub, IWalletClient> _hubContext;
    private readonly ILogger<TransactionExecutedConsumer> _logger;

    public TransactionExecutedConsumer(WalletDbContext context, IHubContext<WalletHub, IWalletClient> hubContext, ILogger<TransactionExecutedConsumer> logger)
    {
        _context = context;
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<TransactionExecuted> context)
    {
        var message = context.Message;
        _logger.LogInformation("Processing asynchronous balance update for Asset ID: {AssetId}, Ticker: {Ticker}", 
            message.AssetId, message.Ticker);

        // Fetch the target asset bucket database record
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.Id == message.AssetId);

        if (asset == null)
        {
            _logger.LogError("Asynchronous balance update failed: Asset snapshot with ID {AssetId} not found.", message.AssetId);
            throw new InvalidOperationException($"Asset with ID {message.AssetId} does not exist.");
        }

        // Apply the pre-calculated numeric amount sent by the publisher transaction manager
        // (Since the transaction history record already handles negation for withdrawals, we add it safely here)
        asset.Balance += message.Amount;

        // Persist the aggregate balance mutation to the database out-of-band
        await _context.SaveChangesAsync();

        _logger.LogInformation("Successfully finalized eventual consistency loop. New Balance for {Ticker}: {NewBalance}", 
            asset.Ticker, asset.Balance);
        
        // SignalR WebSocket streaming path:
        // We target only the Group named after the user's explicit ID.
        // This guarantees absolute security -- User A can never sniff User B's balance streams.
        if (!string.IsNullOrEmpty(message.UserId))
        {
            await _hubContext.Clients
                .Group(message.UserId)
                .BalanceUpdated(asset.Id, asset.Balance);
                
            _logger.LogInformation("Real-time balance notification pushed securely to User Group: {UserId}", message.UserId);
        }
    }
}