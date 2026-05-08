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
            .Include(w => w.Assets)
            .FirstOrDefaultAsync(w => w.Id == walletId && w.UserId == userId);

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
            .AnyAsync(w => w.Id == walletId && w.UserId == userId);

        if (!walletExists) 
            return NotFound("Wallet not found or access denied.");

        // Now find the asset within that specific wallet
        var asset = await _context.Assets.FirstOrDefaultAsync(a => a.WalletId == walletId && a.Ticker.ToUpper() == ticker.ToUpper());

        if (asset == null) 
            return NotFound("Asset not found in this wallet.");

        // Remove and save
        _context.Assets.Remove(asset);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}