using WalletService.Dtos;
using WalletService.Common;


namespace WalletService.Services;

public interface ITransactionManager
{
    Task<Result<TransactionResponseDto>> ProcessTransactionAsync(
        Guid walletId, 
        string ticker, 
        CreateTransactionDto dto, 
        string userId,
        CancellationToken cancellationToken);
}