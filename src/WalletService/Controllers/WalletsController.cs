using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using WalletService.Common;
using WalletService.Data;
using WalletService.Dtos;
using WalletService.Models;
using WalletService.Services;


namespace WalletService.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/[controller]")] // Versioning (v1) is an industry best practice
public class WalletsController : ControllerBase
{
    private readonly WalletDbContext _context;
    private readonly ITransactionManager _transactionManager;
    private readonly IDistributedCache _cache;

    public WalletsController(WalletDbContext context, ITransactionManager transactionManager, IDistributedCache cache)
    {
        _context = context;
        _transactionManager = transactionManager;
        _cache = cache;
    }

    // GET: api/v1/wallets
    [HttpGet]
    public async Task<ActionResult<Result<IEnumerable<Wallet>>>> GetWallets()
    {
        // Extract ID from the JWT 'sub' claim
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(Result<List<Wallet>>.Failure("User not identified."));
        
        // Establish a structured cache key
        string cacheKey =$"user_wallets_{userId}";

        try
        {
            // Attempt an in-memory look up directly from Redis RAM
            var cachedData = await _cache.GetStringAsync(cacheKey);
            if (!string.IsNullOrEmpty(cachedData))
            {
                // Cache Hit! Instantly deserialize and serve data in under 2ms
                var cachedWallets = JsonSerializer.Deserialize<List<Wallet>>(cachedData);
                return Ok(Result<List<Wallet>>.Success(cachedWallets!));
            }
        }
        catch (Exception)
        {
            // Fail-Safe: If Redis is down, allow the application to proceed gracefully to the DB
        }

        // Cache Miss! Fall back to the disk-based SQLite ledger tables
        // We include Assets so you can see the related data in one call
        var userWallets = await _context.Wallets
            .Where(w => w.UserId == userId)
            .Include(i => i.Assets)
            .ToListAsync();

        try
        {
            // Hydrate Redis out-of-band so subsequent read calls are lightning fast
            var cacheOptions = new DistributedCacheEntryOptions
            {
                // Sliding expiration pushes out the lease time if the user is actively navigating
                SlidingExpiration = TimeSpan.FromMinutes(15),
                // Absolute expiration limits stale memory exposure even under heavy usage
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(4)
            };

            var serializedData = JsonSerializer.Serialize(userWallets);
            await _cache.SetStringAsync(cacheKey, serializedData, cacheOptions);
        }
        catch (Exception)
        {
            // Fail-Safe: Do not crash the user request if a cache-write fails
        }

        return Ok(Result<IEnumerable<Wallet>>.Success(userWallets));
    }

    // POST: api/v1/wallets
    [HttpPost]
    public async Task<ActionResult<Result<Wallet>>> CreateWallet(CreateWalletDto walletDto)
    {
        // Get the real ID from the token (the source of truth)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized(Result<Wallet>.Failure("User not identified."));

        // Create the wallet object
        var wallet = new Wallet
        {
            Id = Guid.NewGuid(),
            Name = walletDto.Name,
            UserId = userId, // Forced ownership
            CreatedAt = DateTime.UtcNow,
            Assets = new List<Asset>()
        };

        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();

        try
        {
            // OPTIMIZATION GUARD: Proactively evict the cache key on schema creation
            await _cache.RemoveAsync($"user_wallets_{userId}");
        }
        catch (Exception)
        {

        }

        return CreatedAtAction(nameof(GetWallets), new { id = wallet.Id }, Result<Wallet>.Success(wallet));
    }

    // POST: api/v1/wallets/{walletId}/assets
    [HttpPost("{walletId}/assets")]
    public async Task<ActionResult<Result<Asset>>> AddAssetToWallet(Guid walletId, AddAssetDto assetDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Find the wallet AND verify ownership
        var wallet = await _context.Wallets
            .Include(i => i.Assets)
            .FirstOrDefaultAsync(f => f.Id == walletId && f.UserId == userId);

        if (wallet == null) return NotFound(Result<Asset>.Failure("Wallet not found or you don't have access."));

        // Check if asset already exists (don't want two BTC accounts in one wallet)
        if (wallet.Assets.Any(a => a.Ticker.ToUpper() == assetDto.Ticker.ToUpper()))
            return BadRequest(Result<Asset>.Failure("Asset already exists in this wallet."));

        // Add the asset
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            Ticker = assetDto.Ticker.ToUpper(),
            Balance = assetDto.InitialBalance,
            WalletId = walletId
        };

        _context.Assets.Add(asset);
        await _context.SaveChangesAsync();

        try
        {
            // OPTIMIZATION GUARD: Proactively evict the cache key on schema creation
            await _cache.RemoveAsync($"user_wallets_{userId}");
        }
        catch (Exception)
        {

        }


        return Ok(Result<Asset>.Success(asset));
    }

    // DELETE: api/v1/wallets/{walletId}/assets/{ticker}
    [HttpDelete("{walletId}/assets/{ticker}")]
    public async Task<ActionResult<Result<string>>> RemoveAsset(Guid walletId, string ticker)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify the Wallet belongs to the user first
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound(Result<string>.Failure("Wallet not found or you don't have access."));

        // Now find the asset within that specific wallet
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound(Result<string>.Failure("Asset not found in this wallet."));

        // Remove and save
        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        try
        {
            // OPTIMIZATION GUARD: Proactively evict the cache key on schema creation
            // so the user dashboard reflects the deleted row instantly
            await _cache.RemoveAsync($"user_wallets_{userId}");
        }
        catch (Exception)
        {

        }

        return Ok(Result<string>.Success("Asset removed successfully."));
    }

    // POST: api/v1/wallets/{walletId}/assets/{ticker}/deposit
    [Obsolete("This endpoint is deprecated. Use POST api/v1/wallets/{walletId}/assets/{ticker}/transactions instead.", error: true)]
    [HttpPost("{walletId}/assets/{ticker}/deposit")]
    public async Task<ActionResult<Result<TransactionResponseDto>>> Deposit(Guid walletId, string ticker, [FromBody] decimal amount)
    {
        if (amount <= 0) return BadRequest(Result<TransactionResponseDto>.Failure("Amount must be positive."));
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // First, verify the Wallet belongs to the user
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound(Result<TransactionResponseDto>.Failure("Wallet not found or you don't have access."));

        // Now find the asset inside that specific wallet
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound(Result<TransactionResponseDto>.Failure("Asset not found in this wallet."));

        // Update Balance
        asset.Balance += amount;

        // Record Transaction for audit trail
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AssetId = asset.Id,
            Amount = amount,
            Type = TransactionType.Deposit,
            Timestamp = DateTime.UtcNow,
            Description = $"Deposit of {amount} {ticker.ToUpper()}."
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var response = new TransactionResponseDto
        {
            Ticker = asset.Ticker,
            NewBalance = asset.Balance,
            TransactionId = transaction.Id,
            Timestamp = transaction.Timestamp
        };

        return Ok(Result<TransactionResponseDto>.Success(response));
    }

    // POST: api/v1/wallets/{walletId}/assets/{ticker}/withdraw
    [Obsolete("This endpoint is deprecated. Use POST api/v1/wallets/{walletId}/assets/{ticker}/transactions instead.", error: true)]
    [HttpPost("{walletId}/assets/{ticker}/withdraw")]
    public async Task<ActionResult<Result<TransactionResponseDto>>> Withdraw(Guid walletId, string ticker, [FromBody] decimal amount)
    {
        if (amount <= 0) return BadRequest(Result<TransactionResponseDto>.Failure("Amount must be positive."));
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify the Wallet belongs to the user
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound(Result<TransactionResponseDto>.Failure("Wallet not found or you don't have access."));

        // Find the asset
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound(Result<TransactionResponseDto>.Failure("Asset not found in this wallet."));

        // Business Rule: Check for sufficient funds
        if (asset.Balance < amount)
        {
            return BadRequest(Result<TransactionResponseDto>.Failure($"Insufficient funds. Current balance: {asset.Balance} {ticker.ToUpper()}."));
        }

        // Update Balance
        asset.Balance -= amount;

        // Record Transaction
        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AssetId = asset.Id,
            Amount = -amount, // We record withdrawals as negative values in the ledger
            Type = TransactionType.Withdrawal,
            Timestamp = DateTime.UtcNow,
            Description = $"Withdrawal of {amount} {ticker.ToUpper()}."
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var response = new TransactionResponseDto
        {
            Ticker = asset.Ticker,
            NewBalance = asset.Balance,
            TransactionId = transaction.Id,
            Timestamp = transaction.Timestamp
        };

        return Ok(Result<TransactionResponseDto>.Success(response));
    }

    // GET: api/v1/wallets/{walletId}/assets/{ticker}/transactions
    [HttpGet("{walletId}/assets/{ticker}/transactions")]
    public async Task<ActionResult<Result<IEnumerable<Transaction>>>> GetTransactionHistory(Guid walletId, string ticker)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify ownership of the wallet first
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) return NotFound(Result<IEnumerable<Transaction>>.Failure("Wallet not found."));

        // Fetch transactions for the asset within that wallet
        var transactions = await _context.Transactions
            // Uncomment to eager-load Asset and show it on the list
            // .Include(i => i.Asset)
            .Where(w => w.Asset.WalletId == walletId && w.Asset.Ticker.ToUpper() == ticker.ToUpper())
            .OrderByDescending(o => o.Timestamp) // Newest first
            .ToListAsync();

        return Ok(Result<IEnumerable<Transaction>>.Success(transactions));
    }

    // POST: api/v1/wallets/{walletId}/assets/{ticker}/transactions
    [HttpPost("{walletId}/assets/{ticker}/transactions")]
    public async Task<ActionResult<Result<TransactionResponseDto>>> CreateTransaction(Guid walletId, string ticker, CreateTransactionDto dto)
    {
        // Extract ID from the JWT token (the strict client source of truth)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        // Route execution over to our extracted transaction domain service engine
        var result = await _transactionManager.ProcessTransactionAsync(walletId, ticker, dto, userId);

        if (!result.IsSuccess)
        {
            return BadRequest(result);
        }

        try
        {
            // OPTIMIZATION GUARD:
            // Wiping out the cache ensures that the subsequent fast-read path 
            // query hits a cache miss and captures the database balance changes
            await _cache.RemoveAsync($"user_wallets_{userId}");
        }
        catch (Exception ex)
        {
            // Fail-Safe: Log the exception to console, but don't stop the request!
            // The transaction successfully hit the DB, which is what matters most.
            Console.WriteLine($"[Resilience Fallback] Redis offline during transaction eviction: {ex.Message}");
        }

        return Ok(result);
    }
}