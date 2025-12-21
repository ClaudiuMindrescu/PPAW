using AudioSeparationApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<UsageQuota> UsageQuotas => Set<UsageQuota>();
    public DbSet<AudioJob> AudioJobs => Set<AudioJob>();
    public DbSet<GuestIdentity> GuestIdentities => Set<GuestIdentity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Plan>().HasData(
            new Plan { Id = 1, Name = "Standard", DailyLimit = 1, Price = 0, Currency = "EUR" },
            new Plan { Id = 2, Name = "Silver", DailyLimit = 3, Price = 9.99m, Currency = "EUR" },
            new Plan { Id = 3, Name = "Gold", DailyLimit = 5, Price = 19.99m, Currency = "EUR" }
        );
    }
}
