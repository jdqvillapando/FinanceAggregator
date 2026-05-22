# Stage 1: Build & Publish using .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ["WalletService.csproj", "./"]
RUN dotnet restore "WalletService.csproj"

COPY . .
RUN dotnet publish "WalletService.csproj" -c Release -o /app/out

# Stage 2: Run using .NET 10 ASP.NET Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/out .

# Ensure SQLite can write to its directory
RUN mkdir -p /app/data && chown -R $APP_UID:$APP_UID /app/data
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/Wallet.db"

ENTRYPOINT ["dotnet", "WalletService.dll"]