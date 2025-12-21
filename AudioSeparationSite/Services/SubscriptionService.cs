using AudioSeparationSite.Data;
using AudioSeparationSite.Models;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Services;

public class SubscriptionService
{
    private readonly ApplicationDbContext _db;

    public SubscriptionService(ApplicationDbContext db)
    {
        _db = db;
    }

    /// <summary>
    /// Returnează abonamentul și planul curent pentru user.
    /// Marchează intern subscrierile expirate și, dacă e nevoie,
    /// îl trece automat pe Standard.
    /// </summary>
    public async Task<(Subscription? Subscription, Plan? Plan)> GetCurrentForUserAsync(int userId)
    {
        var now = DateTime.UtcNow;

        var subs = await _db.Subscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartedAt)
            .ToListAsync();

        // 1) Marchează ce e expirat
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

        // 2) Caută un abonament încă activ
        var active = subs.FirstOrDefault(s => s.Status == "active");

        // 3) Dacă nu mai e nimic activ → pune-l pe Standard
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
                    ExpiresAt = null // Standard nu expiră
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
