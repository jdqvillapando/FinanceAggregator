using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Yarp.ReverseProxy.Transforms;


var builder = WebApplication.CreateBuilder(args);

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
});

builder.Services.AddAuthorization();

// Register YARP
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

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

// Add CORS (Essential for Frontend phase)
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // The future React port
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Must be very early so browsers get permission to talk to the API
app.UseCors("FrontendPolicy");
// Stop abusers before they consume any more resources
app.UseRateLimiter();
// Identifies which YARP route matches the request
app.UseRouting();
// This checks the "Passport" (JWT)
app.UseAuthentication();
// This checks if they are allowed in
app.UseAuthorization();
// Enable the proxy
app.MapReverseProxy();

app.Run();
