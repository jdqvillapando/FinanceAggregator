using Microsoft.EntityFrameworkCore;
using MassTransit;
using WalletService.Models;


namespace WalletService.Data;

public class WalletDbContext : DbContext
{
    public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }

    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<Transaction> Transactions => Set<Transaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply your custom schema constraints first
        base.OnModelCreating(modelBuilder);
        // FORCE all wallet-related domain tables into our isolated schema
        modelBuilder.HasDefaultSchema("wallet_schema");

        // Crucial for Fintech: Define decimal precision
        modelBuilder.Entity<Asset>()
            .Property(a => a.Balance)
            .HasPrecision(18, 8); // Handles satoshis/small crypto fractions
        
        // CRITICAL: Tell MassTransit to map its outbox tables inside wallet_schema
        modelBuilder.AddInboxStateEntity();
        modelBuilder.AddOutboxMessageEntity();
        modelBuilder.AddOutboxStateEntity();
    }
}