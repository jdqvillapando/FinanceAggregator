var builder = WebApplication.CreateBuilder(args);

// Register YARP
builder.Services.AddReverseProxy().LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

var app = builder.Build();

// Enable the proxy
app.MapReverseProxy();

app.Run();
