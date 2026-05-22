using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using FluentValidation.AspNetCore;
using MassTransit;
using IdentityService.Data;
using IdentityService.Middleware;
using IdentityService.Models;
using IdentityService.Services;
using IdentityService.Settings;
using IdentityService.Validators;

var builder = WebApplication.CreateBuilder(args);

// Setup SQLite
builder.Services.AddDbContext<IdentityDbContext>(options =>
{
    var connString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=Identity.db";
    options.UseSqlite(connString);
});

// Setup Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

// Setup FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

// Create a local instance of the JWT settings class
var jwtSettings = new JwtSettings();

// Bind the appsettings.json section directly into that instance
builder.Configuration.GetSection("JwtSettings").Bind(jwtSettings);
// Keep the DI configuration for the TokenService intact
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
// Bind JwtSettings section to the class
// Configure authentication using the explicitly bound object keys
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            // This guarantees the middleware uses the exact same key instance as TokenService
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero,
            // Add this to ensure the claims match the TokenService logic
            NameClaimType = "unique_name" 
        };
    });

builder.Services.AddAuthorization();

// Bind token service
builder.Services.AddScoped<ITokenService, TokenService>();

// Bind MassTransit
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        // Dynamic Host Injection
        // In Docker, RabbitMQ:Host is reinterpreted as RabbitMQ__Host
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "localhost";
        cfg.Host(rabbitHost, "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Resilient Bus Connection (Prevents 500 Startup Crash)
        cfg.UseMessageRetry(r => r.Exponential(5, 
            TimeSpan.FromSeconds(2), 
            TimeSpan.FromSeconds(30), 
            TimeSpan.FromSeconds(5)));
    });
});

// Add other services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<IdentityDbContext>();
        context.Database.Migrate(); // Creates the AspNetUsers tables
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the Identity database.");
    }
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Only redirect to HTTPS if we are not in development to avoid the port warning
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication(); // Critical: Checks if the user has a passport
app.UseAuthorization();  // Critical: Checks if the user is allowed in
app.MapControllers();

app.Run();
