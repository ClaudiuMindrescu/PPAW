using System.Security.Cryptography;
using System.Text;
using AudioSeparationApi.Data;
using AudioSeparationApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly SubscriptionService _subs;

    public AccountController(ApplicationDbContext db, SubscriptionService subs)
    {
        _db = db;
        _subs = subs;
    }

    // ---------- HELPERS ----------
    private static string Hash(string input)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(input)));
    }

    // ---------- DTO-URI ----------
    public record ChangePasswordDto(int UserId, string CurrentPassword, string NewPassword);
    public record DowngradeDto(int UserId);

    // ---------- SUMMARY: info cont + plan + usage + plăți ----------
    [HttpGet("summary")]
    public async Task<IActionResult> Summary([FromQuery] int userId)
    {
        var user = await _db.Users.FindAsync(userId);
        if (user == null) return NotFound("User inexistent.");

        var (sub, plan) = await _subs.GetCurrentForUserAsync(userId);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var usage = await _db.UsageQuotas
            .FirstOrDefaultAsync(u => u.UserId == userId && u.Day == today);

        var used = usage?.UsedCount ?? 0;
        var limit = plan?.DailyLimit ?? 0;

        var payments = await _db.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .ToListAsync();

        return Ok(new
        {
            user = new { user.Id, user.Email, user.CreatedAt },
            plan,
            subscription = sub,
            usage = new { day = today, used, limit },
            payments
        });
    }

    // ---------- SCHIMBARE PAROLĂ ----------
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword) || string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest("Parolele nu pot fi goale.");

        var user = await _db.Users.FindAsync(dto.UserId);
        if (user == null) return NotFound("User inexistent.");

        var currentHash = Hash(dto.CurrentPassword);
        if (!string.Equals(user.PasswordHash, currentHash, StringComparison.OrdinalIgnoreCase))
            return BadRequest("Parola curentă este greșită.");

        user.PasswordHash = Hash(dto.NewPassword);
        await _db.SaveChangesAsync();

        return Ok(new { message = "Parola a fost schimbată cu succes." });
    }

    // ---------- DOWGRADARE LA STANDARD ----------
    [HttpPost("downgrade")]
    public async Task<IActionResult> DowngradeToStandard([FromBody] DowngradeDto dto)
    {
        var user = await _db.Users.FindAsync(dto.UserId);
        if (user == null) return NotFound("User inexistent.");

        var std = await _db.Plans.FirstOrDefaultAsync(p => p.Name == "Standard");
        if (std == null)
        {
            std = new Models.Plan
            {
                Name = "Standard",
                DailyLimit = 1,
                Price = 0,
                Currency = "EUR"
            };
            _db.Plans.Add(std);
            await _db.SaveChangesAsync();
        }

        var now = DateTime.UtcNow;

        // expirăm / anulăm toate abonamentele active
        var actives = await _db.Subscriptions
            .Where(s => s.UserId == user.Id && s.Status == "active")
            .ToListAsync();

        foreach (var s in actives)
        {
            s.Status = "canceled";
        }

        // creăm un nou abonament Standard, fără expirare
        var newSub = new Models.Subscription
        {
            UserId = user.Id,
            PlanId = std.Id,
            Status = "active",
            StartedAt = now,
            ExpiresAt = null
        };
        _db.Subscriptions.Add(newSub);

        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Ai revenit la planul Standard.",
            plan = std
        });
    }
}
