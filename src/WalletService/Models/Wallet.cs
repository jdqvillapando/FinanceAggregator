namespace WalletService.Models;

public class Wallet
{
    public Guid Id { get; set; }
    public string UserId { get; set; } = string.Empty; // Linked to Identity Service later
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation Property: A wallet can have multiple assets (BTC, USD, etc.)
    public List<Asset> Assets { get; set; } = new();
}