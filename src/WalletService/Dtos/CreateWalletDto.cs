namespace WalletService.Dtos;

public class CreateWalletDto
{
    public string Name { get; set; } = string.Empty;
    // We don't include Id or Balance here because the system generates those!
}