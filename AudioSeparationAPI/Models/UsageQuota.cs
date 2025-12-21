namespace AudioSeparationApi.Models;

public class UsageQuota
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateOnly Day { get; set; }
    public int UsedCount { get; set; }
}
