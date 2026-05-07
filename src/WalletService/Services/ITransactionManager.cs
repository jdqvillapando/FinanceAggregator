using WalletService.Dtos;
using WalletService.Models;
using WalletService.Common; // Adjust if your 'Result' model lives elsewhere

namespace WalletService.Services;

public interface ITransactionManager
{
    Task<Result<TransactionResponseDto>> ProcessTransactionAsync(
        Guid walletId, 
        string ticker, 
        CreateTransactionDto dto, 
        string userId);
}