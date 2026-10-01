FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project file assuming context is src/NotificationService or root
COPY ["src/NotificationService/NotificationService.csproj", "src/NotificationService/"]
RUN dotnet restore "src/NotificationService/NotificationService.csproj"

# Copy all files from the local directory and build
COPY . .
WORKDIR "/src/src/NotificationService"
RUN dotnet build "NotificationService.csproj" -c Release -o /app/build
RUN dotnet publish "NotificationService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "NotificationService.dll"]