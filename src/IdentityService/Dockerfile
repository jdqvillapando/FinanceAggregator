# Stage 1: Build & Publish using .NET 10 SDK
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy the project file and restore dependencies
COPY ["IdentityService.csproj", "./"]
RUN dotnet restore "IdentityService.csproj"

# Copy the rest of the source code
COPY . .

# Build and publish the release version
RUN dotnet publish "IdentityService.csproj" -c Release -o /app/out

# Stage 2: Run using .NET 10 ASP.NET Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /app/out .

# Ensure the SQLite database file can be written to
RUN mkdir -p /app/data && chown -R $APP_UID:$APP_UID /app/data
ENV ConnectionStrings__DefaultConnection="Data Source=/app/data/Identity.db"

ENTRYPOINT ["dotnet", "IdentityService.dll"]