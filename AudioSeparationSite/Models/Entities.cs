using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AudioSeparationSite.Models;

public class User
{
    public int Id { get; set; }

    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    // For demo only. In real apps use ASP.NET Identity with hashed passwords + salt.
    [MaxLength(255)]
    public string PasswordHash { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Plan
{
    public int Id { get; set; }
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;
    public int DailyLimit { get; set; }
    public decimal Price { get; set; }
    [MaxLength(3)]
    public string Currency { get; set; } = "EUR";
}

public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PlanId { get; set; }
    [MaxLength(20)]
    public string Status { get; set; } = "active"; // active, canceled, expired
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
}

public class UsageQuota
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly Day { get; set; }
    public int UsedCount { get; set; }
}

public class AudioJob
{
    public int Id { get; set; }
    public int UserId { get; set; }
    [MaxLength(500)]
    public string InputPath { get; set; } = string.Empty;
    [MaxLength(500)]
    public string? OutputVocalsPath { get; set; }
    [MaxLength(500)]
    public string? OutputInstrumentalPath { get; set; }
    [MaxLength(20)]
    public string Status { get; set; } = "queued"; // queued, processing, done, failed
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Payment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PlanId { get; set; }
    public decimal Amount { get; set; }
    [MaxLength(3)]
    public string Currency { get; set; } = "EUR";
    [MaxLength(30)]
    public string Provider { get; set; } = "manual";
    [MaxLength(20)]
    public string Status { get; set; } = "paid";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class GuestIdentity
{
    public int Id { get; set; }
    [MaxLength(64)]
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}