# Stage 1: Build & Publish using .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY ["YarpGateway.csproj", "./"]
RUN dotnet restore "YarpGateway.csproj"

COPY . .
RUN dotnet publish "YarpGateway.csproj" -c Release -o /app/out

# Stage 2: Run using .NET 10 ASP.NET Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "YarpGateway.dll"]