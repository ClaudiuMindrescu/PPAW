namespace AudioSeparationApi.Models;

public class Payment
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PlanId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "EUR";
    public string Provider { get; set; } = "simulated";
    public string Status { get; set; } = "paid";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public Plan? Plan { get; set; }
}
