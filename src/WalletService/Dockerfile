FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project file assuming context is src/WalletService or root
COPY ["src/WalletService/WalletService.csproj", "src/WalletService/"]
RUN dotnet restore "src/WalletService/WalletService.csproj"

# Copy all files from the local directory and build
COPY . .
WORKDIR "/src/src/WalletService"
RUN dotnet build "WalletService.csproj" -c Release -o /app/build
RUN dotnet publish "WalletService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
EXPOSE 5202
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WalletService.dll"]