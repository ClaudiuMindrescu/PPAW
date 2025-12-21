using AudioSeparationSite.Data;
using AudioSeparationSite.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Controllers;

[Authorize]
public class BillingController(ApplicationDbContext db) : Controller
{
    [HttpGet("/billing/checkout")]
    public async Task<IActionResult> Checkout(int planId)
    {
        var plan = await db.Plans.FindAsync(planId);
        if (plan == null) return NotFound();
        return View(plan);
    }

    [HttpPost("/billing/checkout")]
    public async Task<IActionResult> Checkout(int planId, string fullName, string cardNumber, string expiry, string cvv)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var plan = await db.Plans.FindAsync(planId);
        if (plan == null)
        {
            TempData["Error"] = "Planul selectat nu există.";
            return RedirectToAction("Index", "Dashboard");
        }

        // Simulate minimal validation
        if (string.IsNullOrWhiteSpace(fullName) || string.IsNullOrWhiteSpace(cardNumber))
        {
            TempData["Error"] = "Completează câmpurile de plată.";
            return RedirectToAction("Checkout", new { planId });
        }

        // Create payment record (simulated as paid)
        var payment = new Payment
        {
            UserId = userId,
            PlanId = plan.Id,
            Amount = plan.Price,
            Currency = plan.Currency,
            Provider = "simulated",
            Status = "paid",
            CreatedAt = DateTime.UtcNow
        };
        db.Payments.Add(payment);
        await db.SaveChangesAsync();

        // Cancelăm subscrierile active anterioare
var actives = await db.Subscriptions
    .Where(s => s.UserId == userId && s.Status == "active")
    .ToListAsync();
foreach (var s in actives)
{
    s.Status = "canceled";
}

// Setăm expirarea: Standard = fără expirare, plătite = 30 zile
var now = DateTime.UtcNow;
DateTime? expires = null;
if (plan.Price > 0)
{
    expires = now.AddDays(30);
}

db.Subscriptions.Add(new Subscription
{
    UserId = userId,
    PlanId = plan.Id,
    Status = "active",
    StartedAt = now,
    ExpiresAt = expires
});

await db.SaveChangesAsync();
TempData["Message"] = $"Plata a fost procesată. Planul tău este acum: {plan.Name}.";
return RedirectToAction("Index", "Home");

    }
}