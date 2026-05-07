namespace WalletService.Models;

public class Asset
{
    public Guid Id { get; set; }
    public string Ticker { get; set; } = string.Empty; // e.g., BTC, ETH, USD

    //Financial precision is key here
    public decimal Balance { get; set; }
    public Guid WalletId { get; set; }
}