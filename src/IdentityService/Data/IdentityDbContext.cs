using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using IdentityService.Models;

namespace IdentityService.Data;

public class IdentityDbContext : IdentityDbContext<ApplicationUser>
{
    public IdentityDbContext(DbContextOptions<IdentityDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // CRITICAL: Let Identity map its standard tables first
        base.OnModelCreating(builder);

        // FORCE all identity tables into our isolated schema
        builder.HasDefaultSchema("identity_schema");
    }
}