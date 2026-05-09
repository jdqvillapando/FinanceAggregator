namespace WalletService.Dtos;

public class TransactionResponseDto
{
    public string Ticker { get; set; } = string.Empty;
    public decimal NewBalance { get; set; }
    public Guid TransactionId { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}