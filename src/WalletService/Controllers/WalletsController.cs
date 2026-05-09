using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletService.Data;
using WalletService.Dtos;
using WalletService.Models;


namespace WalletService.Controllers;

[ApiController]
[Route("api/v1/[controller]")] // Versioning (v1) is an industry best practice
public class WalletsController : ControllerBase
{
    private readonly WalletDbContext _context;

    public WalletsController(WalletDbContext context)
    {
        _context = context;
    }

    // GET: api/v1/wallets
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Wallet>>> GetWallets()
    {
        // Extract ID from the JWT 'sub' claim
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // We include Assets so you can see the related data in one call
        var userWallets = await _context.Wallets
            .Where(w => w.UserId == userId)
            .Include(i => i.Assets)
            .ToListAsync();

        return Ok(userWallets);
    }

    // POST: api/v1/wallets
    [HttpPost]
    public async Task<ActionResult<Wallet>> CreateWallet(CreateWalletDto walletDto)
    {
        // Get the real ID from the token (the source of truth)
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

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

        return CreatedAtAction(nameof(GetWallets), new { id = wallet.Id }, wallet);
    }

    // POST: api/v1/wallets/{walletId}/assets
    [HttpPost("{walletId}/assets")]
    public async Task<IActionResult> AddAssetToWallet(Guid walletId, AddAssetDto assetDto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Find the wallet AND verify ownership
        var wallet = await _context.Wallets
            .Include(i => i.Assets)
            .FirstOrDefaultAsync(f => f.Id == walletId && f.UserId == userId);

        if (wallet == null) return NotFound("Wallet not found or you don't have access.");

        // Check if asset already exists (don't want two BTC accounts in one wallet)
        if (wallet.Assets.Any(a => a.Ticker.ToUpper() == assetDto.Ticker.ToUpper()))
            return BadRequest("Asset already exists in this wallet.");

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

        return Ok(asset);
    }

    // DELETE: api/v1/wallets/{walletId}/assets/{ticker}
    [HttpDelete("{walletId}/assets/{ticker}")]
    public async Task<IActionResult> RemoveAsset(Guid walletId, string ticker)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify the Wallet belongs to the user first
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound("Wallet not found or you don't have access.");

        // Now find the asset within that specific wallet
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound("Asset not found in this wallet.");

        // Remove and save
        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // POST: api/v1/wallets/{walletId}/assets/{ticker}/deposit
    [HttpPost("{walletId}/assets/{ticker}/deposit")]
    public async Task<IActionResult> Deposit(Guid walletId, string ticker, [FromBody] decimal amount)
    {
        if (amount <= 0) return BadRequest("Amount must be positive.");
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // First, verify the Wallet belongs to the user
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound("Wallet not found or you don't have access.");

        // Now find the asset inside that specific wallet
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound("Asset not found in this wallet.");

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

        return Ok(new {
            NewBalance = asset.Balance,
            TransactionId = transaction.Id
        });
    }

    // POST: api/v1/wallets/{walletId}/assets/{ticker}/withdraw
    [HttpPost("{walletId}/assets/{ticker}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid walletId, string ticker, [FromBody] decimal amount)
    {
        if (amount <= 0) return BadRequest("Amount must be positive.");
        
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify the Wallet belongs to the user
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) 
            return NotFound("Wallet not found or you don't have access.");

        // Find the asset
        var asset = await _context.Assets.FirstOrDefaultAsync(f => f.WalletId == walletId && f.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound("Asset not found in this wallet.");

        // Business Rule: Check for sufficient funds
        if (asset.Balance < amount)
        {
            return BadRequest($"Insufficient funds. Current balance: {asset.Balance} {ticker.ToUpper()}.");
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

        return Ok(new { 
            Ticker = asset.Ticker, 
            NewBalance = asset.Balance, 
            TransactionId = transaction.Id 
        });
    }

    // GET: api/v1/wallets/{walletId}/assets/{ticker}/transactions
    [HttpGet("{walletId}/assets/{ticker}/transactions")]
    public async Task<ActionResult<IEnumerable<Transaction>>> GetTransactionHistory(Guid walletId, string ticker)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // Verify ownership of the wallet first
        var walletExists = await _context.Wallets
            .AnyAsync(a => a.Id == walletId && a.UserId == userId);

        if (!walletExists) return NotFound("Wallet not found.");

        // Fetch transactions for the asset within that wallet
        var transactions = await _context.Transactions
            // Uncomment to eager-load Asset and show it on the list
            // .Include(i => i.Asset)
            .Where(w => w.Asset.WalletId == walletId && w.Asset.Ticker.ToUpper() == ticker.ToUpper())
            .OrderByDescending(o => o.Timestamp) // Newest first
            .ToListAsync();

        return Ok(transactions);
    }
}