using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using IdentityService.Models;
using IdentityService.Dtos;
using IdentityService.Services;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var user = new ApplicationUser 
        { 
            UserName = registerDto.Username, 
            Email = registerDto.Email 
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            return Ok("User registered successfully");
        }

        return BadRequest(result.Errors);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        // Find the user by username
        var user = await _userManager.FindByNameAsync(loginDto.Username);
        // If user doesn't exist, stop here
        if (user == null) return Unauthorized("Invalid username");

        // Check if the password is correct (false, false = don't lockout on failure)
        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        // If password is correct, generate and return the token
        if (result.Succeeded)
        {
            return Ok(new {
                Token = _tokenService.CreateToken(user),
                Username = user.UserName
            });
        }

        // If password fails
        return Unauthorized("Invalid password");
    }
}