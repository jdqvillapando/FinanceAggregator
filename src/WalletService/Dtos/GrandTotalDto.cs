namespace WalletService.Dtos;

public class GrandTotalDto
{
    public decimal GrandTotalUsd { get; set; }
    public List<string> ExcludedTickers { get; set; } = [];
    public bool IsAvailable { get; set; } = true;
}