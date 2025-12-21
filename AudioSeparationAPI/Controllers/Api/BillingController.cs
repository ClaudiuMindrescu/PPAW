using AudioSeparationApi.Data;
using AudioSeparationApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class BillingController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public BillingController(ApplicationDbContext db)
    {
        _db = db;
    }

    public record CheckoutDto(int UserId, int PlanId, string FullName, string CardNumber, string Expiry, string Cvv);

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutDto dto)
    {
        var user = await _db.Users.FindAsync(dto.UserId);
        if (user == null) return NotFound("User inexistent.");

        var plan = await _db.Plans.FindAsync(dto.PlanId);
        if (plan == null) return NotFound("Plan inexistent.");

        var payment = new Payment
        {
            UserId = user.Id,
            PlanId = plan.Id,
            Amount = plan.Price,
            Currency = plan.Currency,
            Provider = "simulated",
            Status = "paid",
            CreatedAt = DateTime.UtcNow
        };
        _db.Payments.Add(payment);

        var actives = await _db.Subscriptions
            .Where(s => s.UserId == user.Id && s.Status == "active")
            .ToListAsync();
        foreach (var s in actives)
            s.Status = "canceled";

        var now = DateTime.UtcNow;
        DateTime? expires = null;
        if (plan.Price > 0)
            expires = now.AddDays(30);

        _db.Subscriptions.Add(new Subscription
        {
            UserId = user.Id,
            PlanId = plan.Id,
            Status = "active",
            StartedAt = now,
            ExpiresAt = expires
        });

        await _db.SaveChangesAsync();

        return Ok(new { message = $"Planul tău este acum {plan.Name}.", plan });
    }
}
