using Microsoft.EntityFrameworkCore;
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
        // FORCE all wallet-related domain tables into our isolated schema
        modelBuilder.HasDefaultSchema("wallet_schema");

        // Crucial for Fintech: Define decimal precision
        modelBuilder.Entity<Asset>()
            .Property(a => a.Balance)
            .HasPrecision(18, 8); // Handles satoshis/small crypto fractions
    }
}