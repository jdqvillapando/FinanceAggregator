using MassTransit;
using NotificationService.Consumers;


var builder = Host.CreateApplicationBuilder(args);

bool isMicroserviceEnabled = builder.Configuration.GetValue("NotificationSvcSettings:Enabled", true);

if (!isMicroserviceEnabled)
{
    Console.WriteLine("NotificationService is disabled via configuration. Exiting execution.");
    return;
}

// Configure MassTransit to hook into the RabbitMQ cluster grid
builder.Services.AddMassTransit(x =>
{
    // Automatically register all consumers inside this worker assembly
    x.AddConsumers(typeof(Program).Assembly);

    x.UsingRabbitMq((context, cfg) =>
    {
        // Target our standard Docker internal host registry address fallback
        var rabbitHost = builder.Configuration["RabbitMQ:Host"] ?? "localhost";
        var rabbitVHost = builder.Configuration["RabbitMQ:VirtualHost"] ?? "/";
        var rabbitUsername = builder.Configuration["RabbitMQ:Username"] ?? "guest";
        var rabbitPassword = builder.Configuration["RabbitMQ:Password"] ?? "guest";
        
        cfg.Host(rabbitHost, rabbitVHost == "/" ? "/" : rabbitVHost, h =>
        {
            h.Username(rabbitUsername);
            h.Password(rabbitPassword);
        });

        // Resilient Bus Connection (Prevents 500 Startup Crash)
        cfg.UseMessageRetry(r => r.Exponential(5, 
            TimeSpan.FromSeconds(2), 
            TimeSpan.FromSeconds(30), 
            TimeSpan.FromSeconds(5)));

        // Configures receive endpoints for registered consumers automatically
        // cfg.ConfigureEndpoints(context);
        cfg.ReceiveEndpoint("notif-transaction-executed-queue", e =>
        {
            // Connect the consumer to this queue
            e.ConfigureConsumer<TransactionExecutedConsumer>(context);
        });

        cfg.ReceiveEndpoint("notif-asset-deleted-queue", e =>
        {
            e.ConfigureConsumer<AssetDeletedConsumer>(context);
        });
    });
});

var host = builder.Build();
await host.RunAsync();
