using AudioSeparationApi.Data;
using AudioSeparationApi.Services;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });


var connStr = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string not found.");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseMySql(connStr, serverVersion));

builder.Services.AddScoped<SubscriptionService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost",
        policy => policy
            .WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Ensure database is created with current schema
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        db.Database.EnsureCreated();
    }
    catch { }
}

app.UseCors("AllowLocalhost");

app.MapControllers();

app.Run();
