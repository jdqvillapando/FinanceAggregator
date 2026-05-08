using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using FluentValidation.AspNetCore;
using IdentityService.Data;
using IdentityService.Models;
using IdentityService.Validators;

var builder = WebApplication.CreateBuilder(args);

// Setup SQLite
builder.Services.AddDbContext<IdentityDbContext>(options =>
    options.UseSqlite("Data Source=Identity.db"));

// Setup Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<IdentityDbContext>()
    .AddDefaultTokenProviders();

// Setup FluentValidation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterDtoValidator>();

// Add other services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication(); // Critical: Checks if the user has a passport
app.UseAuthorization();  // Critical: Checks if the user is allowed in
app.MapControllers();

app.Run();
