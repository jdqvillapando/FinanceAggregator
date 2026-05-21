using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using FluentValidation.AspNetCore;
using MassTransit;
using StackExchange.Redis;
using WalletService.Consumers;
using WalletService.Data;
using WalletService.Middleware;
using WalletService.Services;
using WalletService.Validators;
using WalletService.Hubs;


var builder = WebApplication.CreateBuilder(args);

// Register DbContext
builder.Services.AddDbContext<WalletDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add Authentication Services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
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

// Bind Transaction Manager
builder.Services.AddScoped<ITransactionManager, TransactionManager>();

// Bind SignalR services to the DI container
builder.Services.AddSignalR();

// Register a single thread-safe connection pool instance to avoid socket exhaustion
builder.Services.AddSingleton<IConnectionMultiplexer>(sp => 
{
    // Enforce default or fallback port mappings to 5207 (Redis listens to port 6379 by default)
    var configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:5207";
    return ConnectionMultiplexer.Connect(configuration);
});

// Configure .NET's standard IDistributedCache abstraction layer backed by Redis
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis") ?? "localhost:5207";
    // Namespace partitioning isolation
    options.InstanceName = "FinanceAggregator_Wallets:";
});

// Register FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateWalletDtoValidator>();

// Bind MassTransit
builder.Services.AddMassTransit(x =>
{
    // Add the consumer(s)
    x.AddConsumer<UserCreatedConsumer>();
    x.AddConsumer<TransactionExecutedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
        });

        // Configure the "Inbox" (Queue) for this service
        cfg.ReceiveEndpoint("user-created-queue", e =>
        {
            // Connect the consumer to this queue
            e.ConfigureConsumer<UserCreatedConsumer>(context);
        });

        cfg.ReceiveEndpoint("transaction-executed-queue", e =>
        {
            e.ConfigureConsumer<TransactionExecutedConsumer>(context);
        });
    });
});

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure "catch-all" net that handles any unexpected errors
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline
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

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<WalletHub>("/hubs/wallets"); // Expose the secure hub pathway over the server instance

app.Run();
