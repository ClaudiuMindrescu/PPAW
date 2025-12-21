using System.Collections.Generic;

namespace AudioSeparationSite.Models;

public class AccountViewModel
{
    public User User { get; set; } = null!;
    public Plan? CurrentPlan { get; set; }
    public Subscription? CurrentSubscription { get; set; }
    public int TodayUsed { get; set; }
    public int TodayLimit { get; set; }
    public List<Payment> RecentPayments { get; set; } = new();
    public List<Plan> AllPlans { get; set; } = new();
    public int? DaysLeft { get; set; }
public DateTime? ExpiresAt { get; set; }

}
