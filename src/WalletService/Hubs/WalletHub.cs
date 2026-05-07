using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace WalletService.Hubs;

[Authorize] // Guarantees that only users with valid JWT tokens can connect to our real-time streaming channel
public class WalletHub : Hub<IWalletClient>
{
    private readonly ILogger<WalletHub> _logger;

    public WalletHub(ILogger<WalletHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("Real-time WebSocket client connected: User ID {UserId}, Connection ID {ConnectionId}", 
            userId, Context.ConnectionId);
            
        // Map this connection explicitly to a group named after their User ID
        // This allows us to target streaming events directly to this specific user across multiple tabs/devices
        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        _logger.LogInformation("WebSocket client disconnected: User ID {UserId}, Connection ID {ConnectionId}", 
            userId, Context.ConnectionId);

        if (!string.IsNullOrEmpty(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnDisconnectedAsync(exception);
    }
}