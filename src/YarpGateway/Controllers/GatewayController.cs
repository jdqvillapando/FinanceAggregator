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
    public ActionResult<Result<object>> HealthCheck() => Ok(Result<object>.Success(
        new
        {
            status = "Healthy",
            timestamp = DateTime.UtcNow
        }
    ));

    [HttpPost("logout")]
    public ActionResult<Result<string>> Logout()
    {
        Response.Cookies.Delete("jwt");

        return Ok(Result<string>.Success("Logged out successfully from gateway session"));
    }

}