namespace WalletService.Dtos;

public class AddAssetDto
{
    public string Ticker { get; set; } = string.Empty; // e.g., "BTC"
    public decimal InitialBalance { get; set; }
}