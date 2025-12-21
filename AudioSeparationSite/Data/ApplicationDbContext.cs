using AudioSeparationSite.Models;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<UsageQuota> UsageQuotas => Set<UsageQuota>();
    public DbSet<AudioJob> AudioJobs => Set<AudioJob>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<GuestIdentity> GuestIdentities => Set<GuestIdentity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<UsageQuota>().HasIndex(uq => new { uq.UserId, uq.Day }).IsUnique();
    }
}

public static class SeedData
{
    public static void EnsureSeeded(ApplicationDbContext db)
    {
        if (!db.Plans.Any())
        {
            db.Plans.AddRange(
                new Plan { Name = "Standard", DailyLimit = 1, Price = 0m },
                new Plan { Name = "Silver", DailyLimit = 3, Price = 4.99m },
                new Plan { Name = "Gold", DailyLimit = 5, Price = 9.99m }
            );
            db.SaveChanges();
        }

        if (!db.Users.Any())
        {
            var user = new Models.User { Email = "demo@local", PasswordHash = System.Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes("demo"))) };
            db.Users.Add(user);
            db.SaveChanges();

            var std = db.Plans.First(p => p.Name == "Standard");
            db.Subscriptions.Add(new Subscription
            {
                UserId = user.Id,
                PlanId = std.Id,
                Status = "active",
                StartedAt = DateTime.UtcNow
            });
            db.SaveChanges();
        }
    }
}