namespace AudioSeparationApi.Models;

public class AudioJob
{
    public int Id { get; set; }
    public int? UserId { get; set; }
    public int? GuestId { get; set; }
    public string InputPath { get; set; } = string.Empty;
    public string? OutputVocalsPath { get; set; }
    public string? OutputInstrumentalPath { get; set; }
    public string Status { get; set; } = "processing"; // processing, done
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
    public GuestIdentity? Guest { get; set; }
}
