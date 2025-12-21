namespace AudioSeparationApi.Models;

public class GuestIdentity
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public int DailyLimit { get; set; } = 1;
    public int UsedToday { get; set; } = 0;
    public DateTime? LastResetDate { get; set; }

    public ICollection<AudioJob> AudioJobs { get; set; } = new List<AudioJob>();
}
