using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using YarpGateway.Common;


var builder = WebApplication.CreateBuilder(args);
var maintenanceModeEnabled = builder.Configuration.GetValue("GatewaySettings:MaintenanceModeEnabled", false);

// Add CORS (Essential for Frontend)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {        
        policy.SetIsOriginAllowed(origin =>
        {
            var host = new Uri(origin).Host;
            return host == "localhost" || host.EndsWith(".azurestaticapps.net");
        })
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Add Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("api-limiter", opt =>
    {
        opt.Window = TimeSpan.FromSeconds(10);
        opt.PermitLimit = 10; // Max 10 requests per 10 seconds per connection
        opt.QueueLimit = 2;
    });
});

// Register YARP
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// Add Authentication Services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        // Uses the key from appsettings.json
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JwtSettings:Key"]!)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            // If the request is for our SignalR hub route, extract the query token
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/wallets"))
            {
                context.Token = accessToken;
            }
            
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Must be very early so browsers get permission to talk to the API
app.UseCors("FrontendPolicy");
// Stop abusers before they consume any more resources
app.UseRateLimiter();
// Identifies which YARP route matches the request
app.UseRouting();

// =======================================================================
// LIGHTWEIGHT PRE-WARM HEALTH ENDPOINT
// =======================================================================
// Placed before UseAuthentication & UseAuthorization so cold-start pings 
// return instantly without needing a JWT token or triggering database checks.
app.MapGet("/health", async () => await Task.FromResult(
    Results.Ok(
        Result<object>.Success(
            new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow
            }
        )
    )
));

app.Use(async (context, next) =>
{
    // Bypasses health checks for container warming, but blocks all API routes
    if (maintenanceModeEnabled && !context.Request.Path.StartsWithSegments("/health"))
    {
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        context.Response.ContentType = "application/json";
        
        await context.Response.WriteAsJsonAsync(Result<string>.Failure($"[{DateTime.UtcNow}] System is in maintenance mode. Active sessions have been suspended (HTTP Status {StatusCodes.Status503ServiceUnavailable})."));
        return;
    }

    await next();
});

// =======================================================================
// FIX: METADATA CORS EVALUATOR BRIDGE (NEW FOR WEBSOCKETS HANDSHAKE)
// =======================================================================
// This MUST go exactly here so the Endpoint Middleware can validate 
// the "CorsPolicy" metadata attached to your wallet-hub-route!
app.UseCors();

// This checks the "Passport" (JWT)
app.UseAuthentication();
// This checks if they are allowed in
app.UseAuthorization();
// Enable the proxy
app.MapReverseProxy();

app.Run();
