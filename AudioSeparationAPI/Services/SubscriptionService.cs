using AudioSeparationApi.Data;
using AudioSeparationApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Services;

public class SubscriptionService
{
    private readonly ApplicationDbContext _db;

    public SubscriptionService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(Subscription? Subscription, Plan? Plan)> GetCurrentForUserAsync(int userId)
    {
        var now = DateTime.UtcNow;

        var subs = await _db.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();

        var changed = false;
        foreach (var s in subs.Where(s => s.Status == "active" && s.ExpiresAt != null))
        {
            if (s.ExpiresAt < now)
            {
                s.Status = "expired";
                changed = true;
            }
        }

        if (changed)
        {
            await _db.SaveChangesAsync();
        }

        var active = subs.FirstOrDefault(s => s.Status == "active");

        if (active == null)
        {
            var std = await _db.Plans.FirstOrDefaultAsync(p => p.Name == "Standard");
            if (std != null)
            {
                active = new Subscription
                {
                    UserId = userId,
                    PlanId = std.Id,
                    Status = "active",
                    StartedAt = now,
                    ExpiresAt = null
                };
                _db.Subscriptions.Add(active);
                await _db.SaveChangesAsync();
            }
        }

        Plan? plan = null;
        if (active != null)
        {
            plan = await _db.Plans.FindAsync(active.PlanId);
        }

        return (active, plan);
    }
}
