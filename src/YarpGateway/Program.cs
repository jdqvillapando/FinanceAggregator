using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using YarpGateway.Common;


var builder = WebApplication.CreateBuilder(args);
var maintenanceModeEnabled = builder.Configuration.GetValue("GatewaySettings:MaintenanceModeEnabled", false);

// Register controllers
builder.Services.AddControllers();

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

app.Use(async (context, next) =>
{
    // Blocks all API routes when in maintenance mode
    if (maintenanceModeEnabled)
    {
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        context.Response.ContentType = "application/json";
        
        await context.Response.WriteAsJsonAsync(Result<string>.Failure($"[{DateTime.UtcNow}] System is in maintenance mode. Active sessions have been suspended (HTTP Status {StatusCodes.Status503ServiceUnavailable})."));
        return;
    }

    await next();
});

// JWT inbound interceptor
// Extract JWT from Cookie or Query string and attach Bearer header downstream.
app.Use(async (context, next) =>
{
    string? token = context.Request.Cookies["jwt"];

    if (string.IsNullOrEmpty(token) && context.Request.Query.ContainsKey("access_token"))
    {
        token = context.Request.Query["access_token"];
    }

    if (!string.IsNullOrEmpty(token))
    {
        context.Request.Headers.Authorization = $"Bearer {token}";
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

// JWT outbound interceptor
// Conceal token from AuthResponse JSON body and issue HttpOnly cookie on Login.
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
    var isLoginRequest = path.EndsWith("/auth/login") || path.Contains("/api/v1/auth/login");

    if (!isLoginRequest)
    {
        await next();
        return;
    }

    var originalBodyStream = context.Response.Body;
    using var responseBody = new MemoryStream();
    context.Response.Body = responseBody;

    await next();

    if (context.Response.StatusCode == 200)
    {
        responseBody.Seek(0, SeekOrigin.Begin);
        string responseText = await new StreamReader(responseBody).ReadToEndAsync();

        try
        {
            using var jsonDoc = System.Text.Json.JsonDocument.Parse(responseText);
            var root = jsonDoc.RootElement;

            // Handle both flat AuthResponse and Result<AuthResponse> wrapped JSON payloads
            string? token = null;
            string? username = null;

            if (root.TryGetProperty("data", out var dataEl) && dataEl.ValueKind == System.Text.Json.JsonValueKind.Object)
            {
                if (dataEl.TryGetProperty("token", out var tEl)) token = tEl.GetString();
                if (dataEl.TryGetProperty("username", out var uEl)) username = uEl.GetString();
            }
            else
            {
                if (root.TryGetProperty("token", out var tEl)) token = tEl.GetString();
                if (root.TryGetProperty("username", out var uEl)) username = uEl.GetString();
                if (username == null && root.TryGetProperty("user", out var usrEl)) username = usrEl.GetString();
            }

            if (!string.IsNullOrEmpty(token))
            {
                // Issue HttpOnly Cookie with proper local/prod environment flags
                context.Response.Cookies.Append("jwt", token, new CookieOptions
                {
                    HttpOnly = true,                                // Blocks XSS script reading
                    Secure = context.Request.IsHttps,               // Enforces HTTPS transport; Dynamically true on HTTPS, false on local HTTP
                    SameSite = SameSiteMode.Lax,                    // Blocks XSRF cross-site auto-attachment
                    Path = "/",                                     // Scopes cookie to entire domain path
                    Expires = DateTimeOffset.UtcNow.AddHours(1)     // Set cookie TTL to match the 60-minute JWT expiration in appsettings.json
                });

                // Write concealed JSON response back to client (token omitted)
                var modifiedResponse = Result<object>.Success(new { username });
                var modifiedJson = JsonSerializer.Serialize(modifiedResponse, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });

                context.Response.Body = originalBodyStream;
                context.Response.Headers.ContentLength = Encoding.UTF8.GetByteCount(modifiedJson);
                await context.Response.WriteAsync(modifiedJson);

                return;
            }
        }
        catch
        {
            // If JSON parsing fails, fall back gracefully to original response
        }
    }

    responseBody.Seek(0, SeekOrigin.Begin);
    await responseBody.CopyToAsync(originalBodyStream);
});

// Enable controllers
app.MapControllers();

// Enable the proxy
app.MapReverseProxy();

app.Run();
