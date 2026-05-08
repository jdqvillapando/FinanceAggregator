using Microsoft.EntityFrameworkCore;
using WalletService.Models;


namespace WalletService.Data;

public class WalletDbContext : DbContext
{
    public WalletDbContext(DbContextOptions<WalletDbContext> options) : base(options) { }

    public DbSet<Wallet> Wallets => Set<Wallet>();
    public DbSet<Asset> Assets => Set<Asset>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Crucial for Fintech: Define decimal precision
        modelBuilder.Entity<Asset>()
            .Property(a => a.Balance)
            .HasPrecision(18, 8); // Handles satoshis/small crypto fractions
    }
}