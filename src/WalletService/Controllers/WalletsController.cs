using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WalletService.Data;
using WalletService.Models;
using WalletService.Dtos;

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
}