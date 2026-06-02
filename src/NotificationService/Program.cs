using MassTransit;
using NotificationService.Consumers;


var builder = Host.CreateApplicationBuilder(args);

// Configure MassTransit to hook into the RabbitMQ cluster grid
builder.Services.AddMassTransit(x =>
{
    // Automatically register all consumers inside this worker assembly
    x.AddConsumers(typeof(Program).Assembly);

    x.UsingRabbitMq((context, cfg) =>
    {
        // Target our standard Docker internal host registry address fallback
        var rabbitMqHost = builder.Configuration["RabbitMQ:Host"] ?? "localhost";
        cfg.Host(rabbitMqHost, "/", h =>
        {
            h.Username("guest");
            h.Password("guest");
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
    });
});

var host = builder.Build();
host.Run();
