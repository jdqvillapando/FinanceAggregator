using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MassTransit;
using Contracts;
using IdentityService.Common;
using IdentityService.Dtos;
using IdentityService.Models;
using IdentityService.Services;

namespace IdentityService.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ITokenService _tokenService;
    private readonly IPublishEndpoint _publishEndpoint;

    public AuthController(UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, ITokenService tokenService, IPublishEndpoint publishEndpoint)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _publishEndpoint = publishEndpoint;
    }

    [HttpPost("register")]
    public async Task<ActionResult<string>> Register(RegisterDto registerDto)
    {
        var user = new ApplicationUser 
        { 
            UserName = registerDto.Username, 
            Email = registerDto.Email,
            FullName = registerDto.FullName!
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (result.Succeeded)
        {
            // MassTransit does magic here
            await _publishEndpoint.Publish<UserCreated>(new
            {
                UserId = user.Id,
                Email = user.Email!,
                FullName = user.FullName!
            });

            return Ok(Result<string>.Success("User registered successfully"));
        }

        // Join all Identity errors into a single string for the Result envelope
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));

        return BadRequest(Result<string>.Failure(errors));
    }

    [HttpPost("login")]
    public async Task<ActionResult<Result<AuthResponseDto>>> Login(LoginDto loginDto)
    {
        // Find the user by username
        var user = await _userManager.FindByNameAsync(loginDto.Username);
        // If user doesn't exist, stop here
        if (user == null) return Unauthorized(Result<AuthResponseDto>.Failure("Invalid username"));

        // Check if the password is correct (false, false = don't lockout on failure)
        var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, false);

        // If password is correct, generate and return the token
        if (result.Succeeded)
        {
            var response = new AuthResponseDto
            {
              Token = _tokenService.CreateToken(user),
              Username = user.UserName!
            };
            
            return Ok(Result<AuthResponseDto>.Success(response));
        }

        // If password fails
        return Unauthorized(Result<AuthResponseDto>.Failure("Invalid password"));
    }
}