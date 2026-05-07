FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution structures and restore dependencies
COPY ["NotificationService.csproj", "./"]
RUN dotnet restore "NotificationService.csproj"

# Copy the rest of the source code and compile
COPY . .
RUN dotnet publish "NotificationService.csproj" -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/runtime:10.0
WORKDIR /app

COPY --from=build /app/out .

ENTRYPOINT ["dotnet", "NotificationService.dll"]