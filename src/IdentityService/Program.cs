using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
    options.UseSqlite("Data Source=Identity.db"));

// Setup Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

// Setup FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

// Bind JwtSettings section to the class
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Bind token service
builder.Services.AddScoped<ITokenService, TokenService>();

// Bind MassTransit
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });
    });
});

// Add other services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

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
