namespace AudioSeparationApi.Models;

public class Plan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int DailyLimit { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "EUR";

    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
