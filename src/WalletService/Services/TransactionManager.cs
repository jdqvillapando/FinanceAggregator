using Microsoft.EntityFrameworkCore;
using MassTransit;
using WalletService.Contracts;
using WalletService.Common;
using WalletService.Data;
using WalletService.Dtos;
using WalletService.Models;

namespace WalletService.Services;

public class TransactionManager : ITransactionManager
{
    private readonly WalletDbContext _context;
    private readonly IPublishEndpoint _publishEndpoint;

    public TransactionManager(WalletDbContext context, IPublishEndpoint publishEndpoint)
    {
        _context = context;
        _publishEndpoint = publishEndpoint;
    }

    public async Task<Result<TransactionResponseDto>> ProcessTransactionAsync(
        Guid walletId, 
        string ticker, 
        CreateTransactionDto dto, 
        string userId)
    {
        // Authorization Guard: Verify ownership of the wallet first
        var walletExists = await _context.Wallets
            .AnyAsync(w => w.Id == walletId && w.UserId == userId);

        if (!walletExists)
        {
            return Result<TransactionResponseDto>.Failure("Target wallet not found or access denied.");
        }

        // Locate the asset bucket matching this wallet and ticker
        var asset = await _context.Assets
            .FirstOrDefaultAsync(a => a.WalletId == walletId 
                                 && a.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null)
        {
            return Result<TransactionResponseDto>.Failure($"Asset balance sheet for ticker '{ticker}' not found.");
        }

        // Evaluate mathematical adjustments based on transaction type classification
        if (dto.Type == TransactionType.Deposit)
        {
            asset.Balance += dto.Amount;
        }
        else if (dto.Type == TransactionType.Withdrawal)
        {
            if (asset.Balance < dto.Amount)
            {
                return Result<TransactionResponseDto>.Failure("Insufficient funds to complete withdrawal processing.");
            }
            asset.Balance -= dto.Amount;
        }
        else
        {
            return Result<TransactionResponseDto>.Failure("Invalid transaction type classification specified.");
        }

        // Instantiate and log the immutable historical ledger row
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AssetId = asset.Id,
            Amount = dto.Type == TransactionType.Withdrawal ? -dto.Amount : dto.Amount,
            Type = dto.Type,
            Description = dto.Description,
            Timestamp = DateTime.UtcNow
        };

        _context.Transactions.Add(transaction);

        // Commit mutations atomically within a single transactional unit
        await _context.SaveChangesAsync();

        // Safely publish our contract to the message bus after database success.
        // We transform our internal domain enum into a string to preserve backward compatibility.
        await _publishEndpoint.Publish(new TransactionExecuted
        {
            TransactionId = transaction.Id,
            WalletId = walletId,
            AssetId = asset.Id,
            Ticker = asset.Ticker,
            Amount = transaction.Amount,
            // Converts to "Deposit" or "Withdrawal" strings seamlessly
            Type = transaction.Type.ToString(),
            Description = transaction.Description,
            Timestamp = transaction.Timestamp,
            UserId = userId
        });

        // Build the mapped tracking response object
        var response = new TransactionResponseDto
        {
            Ticker = asset.Ticker,
            NewBalance = asset.Balance,
            TransactionId = transaction.Id,
            Timestamp = transaction.Timestamp
        };

        return Result<TransactionResponseDto>.Success(response);
    }
}