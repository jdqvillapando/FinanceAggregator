using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using YarpGateway.Common;


namespace YarpGateway.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class GatewayController : ControllerBase
{
    // Health check is now transferred here.
    [AllowAnonymous]
    [HttpGet("health")]
    public async Task<ActionResult<Result<object>>> HealthCheck() => await Task.FromResult(Ok(Result<object>.Success(
        new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow
        }
    )));

    [HttpPost("logout")]
    public async Task<ActionResult<Result<string>>> Logout()
    {
        Response.Cookies.Delete("jwt");

        return await Task.FromResult(Ok(Result<string>.Success("Logged out successfully from gateway session")));
    }

}