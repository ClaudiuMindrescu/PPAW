using System.Security.Cryptography;
using System.Text;
using AudioSeparationApi.Data;
using AudioSeparationApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AuthController(ApplicationDbContext db)
    {
        _db = db;
    }

    // DTO-uri simple pentru request-uri
    public record RegisterDto(string Email, string Password);
    public record LoginDto(string Email, string Password);

    // Funcție simplă de hash (la fel ca înainte)
    private static string Hash(string input)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(input)));
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest("Email și parola sunt obligatorii.");

            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict("Există deja un cont cu acest email.");

            var user = new User
            {
                Email = dto.Email,
                PasswordHash = Hash(dto.Password)
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // căutăm planul Standard, îl creăm dacă nu există
            var std = await _db.Plans.FirstOrDefaultAsync(p => p.Name == "Standard");
            if (std == null)
            {
                std = new Plan
                {
                    Name = "Standard",
                    DailyLimit = 1,
                    Price = 0,
                    Currency = "EUR"
                };
                _db.Plans.Add(std);
                await _db.SaveChangesAsync();
            }

            _db.Subscriptions.Add(new Subscription
            {
                UserId = user.Id,
                PlanId = std.Id,
                Status = "active",
                StartedAt = DateTime.UtcNow,
                ExpiresAt = null
            });
            await _db.SaveChangesAsync();

            return Ok(new { user.Id, user.Email, user.Role, user.CreatedAt });
        }
        catch (Exception ex)
        {
            // ca să vezi în React exact ce nu-i convine API-ului
            return StatusCode(500, $"Eroare la înregistrare: {ex.Message}");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var hash = Hash(dto.Password ?? string.Empty);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.PasswordHash == hash);

        if (user == null)
            return Unauthorized("Email sau parolă greșite.");

        return Ok(new { user.Id, user.Email, user.Role, user.CreatedAt });
    }

    [HttpPost("guest")]
    public async Task<IActionResult> CreateGuestSession()
    {
        try
        {
            // Generez token unic de 64 caractere
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            
            var guestIdentity = new GuestIdentity
            {
                Token = token,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24),
                DailyLimit = 1,
                UsedToday = 0,
                LastResetDate = DateTime.UtcNow.Date
            };

            _db.GuestIdentities.Add(guestIdentity);
            await _db.SaveChangesAsync();

            return Ok(new 
            { 
                guestToken = token,
                expiresAt = guestIdentity.ExpiresAt,
                dailyLimit = 1,
                usedToday = 0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Eroare la crearea sesiunii guest: {ex.Message}");
        }
    }
}
