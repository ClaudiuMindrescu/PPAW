namespace AudioSeparationApi.Models;

public class Subscription
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PlanId { get; set; }
    public string Status { get; set; } = "active"; // active, canceled, expired
    public DateTime StartedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }

    public User? User { get; set; }
    public Plan? Plan { get; set; }
}
