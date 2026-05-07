using IdentityService.Models;

namespace IdentityService.Services;

public interface ITokenService
{
    string CreateToken(ApplicationUser user);
}