using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using IdentityService.Models;
using IdentityService.Settings;

namespace IdentityService.Services;

public class TokenService : ITokenService
{
    private readonly JwtSettings _settings;
    private readonly SymmetricSecurityKey _key;

    public TokenService(IOptions<JwtSettings> settings)
    {
        _settings = settings.Value;

        // Safety check: ensure the key isn't null before creating the security key
        if (string.IsNullOrEmpty(_settings.Key))
            throw new ArgumentException("JWT Key is missing from configuration");

        // Turn our secret string into a byte array for the algorithm
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
    }

    public string CreateToken(ApplicationUser user)
    {
        // Define the "Claims" (The info inside the passport)
        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? ""),
            new Claim("preferred_username", user.UserName ?? "")
        };

        // Define the Credentials (The "Seal" on the passport)
        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

        // Create the Token Descriptor
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(_settings.DurationInMinutes),
            SigningCredentials = creds,
            Issuer = _settings.Issuer,
            Audience = _settings.Audience
        };

        // Generate the actual token string
        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }
}