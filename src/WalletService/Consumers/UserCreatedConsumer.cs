using MassTransit;
using Contracts;
using WalletService.Data;
using WalletService.Models;


namespace WalletService.Consumers;

public class UserCreatedConsumer : IConsumer<UserCreated>
{
    private readonly WalletDbContext _dbContext;

    public UserCreatedConsumer(WalletDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task Consume(ConsumeContext<UserCreated> context)
    {
        // dbContext.Message contains the RabbitMQ data
        // _dbContext is your link to the SQLite/SQL database
        
        var defaultWallet = new Wallet
        {
            Id = Guid.NewGuid(),
            UserId = context.Message.UserId,
            Name = "Primary Wallet (PHP)",
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Wallets.Add(defaultWallet);
        await _dbContext.SaveChangesAsync();
    }
}