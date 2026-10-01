FROM mcr.microsoft.com/dotnet/sdk:10.0-alpine AS build
WORKDIR /src

# Copy project file assuming context is src/IdentityService or root
COPY ["src/IdentityService/IdentityService.csproj", "src/IdentityService/"]
RUN dotnet restore "src/IdentityService/IdentityService.csproj"

# Copy all files from the local directory and build
COPY . .
WORKDIR "/src/src/IdentityService"
RUN dotnet build "IdentityService.csproj" -c Release -o /app/build
RUN dotnet publish "IdentityService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0-alpine AS final
WORKDIR /app
EXPOSE 5205
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "IdentityService.dll"]