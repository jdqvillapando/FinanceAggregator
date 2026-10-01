FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project file assuming context is src/YarpGateway or root
COPY ["src/YarpGateway/YarpGateway.csproj", "src/YarpGateway/"]
RUN dotnet restore "src/YarpGateway/YarpGateway.csproj"

# Copy all files from the local directory and build
COPY . .
WORKDIR "/src/src/YarpGateway"
RUN dotnet build "YarpGateway.csproj" -c Release -o /app/build
RUN dotnet publish "YarpGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
EXPOSE 5153
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "YarpGateway.dll"]