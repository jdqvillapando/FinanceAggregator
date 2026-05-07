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
        // We include Assets so you can see the related data in one call
        return await _context.Wallets.Include(w => w.Assets).ToListAsync();
    }

    // POST: api/v1/wallets
    [HttpPost]
    public async Task<ActionResult<Wallet>> CreateWallet(CreateWalletDto walletDto)
    {
        var wallet = new Wallet
        {
            Id = Guid.NewGuid(),
            Name = walletDto.Name,
            UserId = "demo-user-123", // Temporary until we build IdentityService
            CreatedAt = DateTime.UtcNow
        };

        _context.Wallets.Add(wallet);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetWallets), new { id = wallet.Id }, wallet);
    }
}