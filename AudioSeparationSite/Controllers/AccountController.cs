using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using AudioSeparationSite.Data;
using AudioSeparationSite.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Controllers;

[AllowAnonymous]
public class AccountController(ApplicationDbContext db) : Controller
{
    private static string Hash(string input)
    {
        using var sha = SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(input)));
    }

    // ----------------- AUTH BASIC -----------------

    [HttpGet("/account/register")]
    public IActionResult Register() => View();

    [HttpPost("/account/register")]
    
    public async Task<IActionResult> Register(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            TempData["Error"] = "Email și parola sunt obligatorii.";
            return View();
        }

        if (await db.Users.AnyAsync(u => u.Email == email))
        {
            TempData["Error"] = "Există deja un cont cu acest email.";
            return View();
        }

        var user = new User
        {
            Email = email,
            PasswordHash = Hash(password)
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Plan Standard implicit
        var std = await db.Plans.FirstAsync(p => p.Name == "Standard");
        db.Subscriptions.Add(new Subscription
        {
            UserId = user.Id,
            PlanId = std.Id,
            Status = "active",
            StartedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();

        await SignIn(user);
        TempData["Message"] = "Cont creat.";
        return RedirectToAction("Index", "Home");
    }

    [HttpGet("/account/login")]
    public IActionResult Login() => View();

    [HttpPost("/account/login")]
  
    public async Task<IActionResult> Login(string email, string password)
    {
        var hash = Hash(password ?? string.Empty);
        var user = await db.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.PasswordHash == hash);

        if (user == null)
        {
            TempData["Error"] = "Email sau parolă incorecte.";
            return View();
        }

        await SignIn(user);
        return RedirectToAction("Index", "Home");
    }

    [Authorize]
    [HttpPost("/account/logout")]
    
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        return RedirectToAction("Index", "Dashboard");
    }

    private async Task SignIn(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email)
        };
        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, principal);
    }

    // ----------------- ACCOUNT PAGE -----------------

    [Authorize]
    [HttpGet("/account")]
    public async Task<IActionResult> Index()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await db.Users.FindAsync(userId);
        if (user == null) return RedirectToAction("Login");

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var sub = await db.Subscriptions
            .OrderByDescending(s => s.StartedAt)
            .FirstOrDefaultAsync(s => s.UserId == userId && s.Status == "active");

        Plan? plan = null;
        var limit = 0;
        if (sub != null)
        {
            plan = await db.Plans.FindAsync(sub.PlanId);
            limit = plan?.DailyLimit ?? 0;
        }

        var usage = await db.UsageQuotas
            .FirstOrDefaultAsync(u => u.UserId == userId && u.Day == today);
        var used = usage?.UsedCount ?? 0;

        var payments = await db.Payments
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.CreatedAt)
            .Take(10)
            .ToListAsync();

        var allPlans = await db.Plans
            .OrderBy(p => p.Price)
            .ToListAsync();

        

// Calculăm expirarea
DateTime? expires = sub?.ExpiresAt;
int? daysLeft = null;

if (expires.HasValue)
{
    daysLeft = (expires.Value.Date - DateTime.UtcNow.Date).Days;
}

var vm = new AccountViewModel
{
    User = user,
    CurrentPlan = plan,
    CurrentSubscription = sub,
    TodayLimit = limit,
    TodayUsed = used,
    RecentPayments = payments,
    AllPlans = allPlans,
    ExpiresAt = expires,
    DaysLeft = daysLeft
};



        return View(vm);
    }

    // ----------------- PASSWORD RESET -----------------

    [Authorize]
    [HttpGet("/account/password")]
    public IActionResult Password() => View();

    [Authorize]
    [HttpPost("/account/password")]
    
    public async Task<IActionResult> Password(string currentPassword, string newPassword)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await db.Users.FindAsync(userId);
        if (user == null) return RedirectToAction("Login");

        var currentHash = Hash(currentPassword ?? string.Empty);
        if (!string.Equals(user.PasswordHash, currentHash, StringComparison.OrdinalIgnoreCase))
        {
            TempData["Error"] = "Parola curentă este incorectă.";
            return View();
        }

        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 4)
        {
            TempData["Error"] = "Parola nouă trebuie să aibă minim 4 caractere.";
            return View();
        }

        user.PasswordHash = Hash(newPassword);
        await db.SaveChangesAsync();
        TempData["Message"] = "Parola a fost actualizată.";
        return RedirectToAction("Index");
    }

    // ----------------- PLAN MANAGEMENT -----------------

    [Authorize]
[HttpPost("/account/cancel-plan")]
public async Task<IActionResult> CancelPlan()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var stdPlan = await db.Plans.FirstOrDefaultAsync(p => p.Name == "Standard");
    if (stdPlan == null)
    {
        TempData["Error"] = "Planul Standard nu există în sistem.";
        return RedirectToAction("Index");
    }

    var actives = await db.Subscriptions
        .Where(s => s.UserId == userId && s.Status == "active")
        .ToListAsync();
    foreach (var s in actives)
    {
        s.Status = "canceled";
    }

    db.Subscriptions.Add(new Subscription
    {
        UserId = userId,
        PlanId = stdPlan.Id,
        Status = "active",
        StartedAt = DateTime.UtcNow,
        ExpiresAt = null
    });

    await db.SaveChangesAsync();
    TempData["Message"] = "Ai revenit la planul Standard.";
    return RedirectToAction("Index");
}

}
