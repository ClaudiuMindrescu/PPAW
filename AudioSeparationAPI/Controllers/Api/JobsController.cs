using AudioSeparationApi.Data;
using AudioSeparationApi.Models;
using AudioSeparationApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class JobsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly SubscriptionService _subs;
    private readonly IWebHostEnvironment _env;

    public JobsController(ApplicationDbContext db, SubscriptionService subs, IWebHostEnvironment env)
    {
        _db = db;
        _subs = subs;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetJobs([FromQuery] int userId)
    {
        var jobs = await _db.AudioJobs
            .Where(j => j.UserId == userId)
            .OrderByDescending(j => j.CreatedAt)
            .Take(20)
            .ToListAsync();
        return Ok(jobs);
    }

    [HttpPost("upload")]
    [RequestSizeLimit(104_857_600)]
    public async Task<IActionResult> Upload([FromQuery] int? userId, [FromQuery] string? guestToken, IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("Fișier lipsă.");

        // Handle guest uploads
        if (!string.IsNullOrEmpty(guestToken))
        {
            var guest = await _db.GuestIdentities
                .FirstOrDefaultAsync(g => g.Token == guestToken);
            
            if (guest == null)
                return Unauthorized("Guest token invalid.");
            
            if (guest.ExpiresAt < DateTime.UtcNow)
                return Unauthorized("Guest session a expirat.");
            
            // Check daily limit for guest (1 file/day)
            var today = DateTime.UtcNow.Date;
            if (guest.LastResetDate == null || guest.LastResetDate < today)
            {
                guest.LastResetDate = today;
                guest.UsedToday = 0;
            }
            
            if (guest.UsedToday >= guest.DailyLimit)
                return BadRequest($"Ai atins limita zilnică ({guest.DailyLimit} fișier/zi).");

            // Upload file
            var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
            Directory.CreateDirectory(uploads);
            var safeName = Path.GetFileName(file.FileName);
            var unique = $"{Guid.NewGuid()}_{safeName}";
            var fullPath = Path.Combine(uploads, unique);
            
            using (var stream = System.IO.File.Create(fullPath))
            {
                await file.CopyToAsync(stream);
            }

            var job = new AudioJob
            {
                GuestId = guest.Id,
                InputPath = unique,
                Status = "processing",
                CreatedAt = DateTime.UtcNow
            };
            _db.AudioJobs.Add(job);
            guest.UsedToday += 1;
            
            await _db.SaveChangesAsync();

            // Simulate processing immediately
            var baseName = Path.GetFileNameWithoutExtension(unique);
            var ext = Path.GetExtension(unique);
            if (string.IsNullOrWhiteSpace(ext))
                ext = ".wav";

            job.Status = "done";
            job.OutputVocalsPath = $"{baseName}_vocals{ext}";
            job.OutputInstrumentalPath = $"{baseName}_backsound{ext}";
            await _db.SaveChangesAsync();

            return Ok(job);
        }

        // Handle authenticated user uploads
        if (!userId.HasValue)
            return BadRequest("UserId sau guestToken sunt obligatorii.");

        var user = await _db.Users.FindAsync(userId.Value);
        if (user == null) return NotFound("User inexistent.");

        var (sub, plan) = await _subs.GetCurrentForUserAsync(userId.Value);
        if (sub == null || plan == null)
            return BadRequest("Nu ai un plan activ.");

        var today2 = DateOnly.FromDateTime(DateTime.UtcNow);
        var usage = await _db.UsageQuotas
            .FirstOrDefaultAsync(u => u.UserId == userId.Value && u.Day == today2);
        var used = usage?.UsedCount ?? 0;
        if (used >= plan.DailyLimit)
            return BadRequest($"Ai atins limita zilnică ({plan.DailyLimit}).");

        var uploads2 = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
        Directory.CreateDirectory(uploads2);
        var safeName2 = Path.GetFileName(file.FileName);
        var unique2 = $"{Guid.NewGuid()}_{safeName2}";
        var fullPath2 = Path.Combine(uploads2, unique2);
        
        using (var stream = System.IO.File.Create(fullPath2))
        {
            await file.CopyToAsync(stream);
        }

        var job2 = new AudioJob
        {
            UserId = userId.Value,
            InputPath = unique2,
            Status = "processing",
            CreatedAt = DateTime.UtcNow
        };
        _db.AudioJobs.Add(job2);

        if (usage == null)
        {
            usage = new UsageQuota
            {
                UserId = userId.Value,
                Day = today2,
                UsedCount = 1
            };
            _db.UsageQuotas.Add(usage);
        }
        else
        {
            usage.UsedCount += 1;
        }

        await _db.SaveChangesAsync();

        // Simulate processing immediately
        var baseName2 = Path.GetFileNameWithoutExtension(unique2);
        var ext2 = Path.GetExtension(unique2);
        if (string.IsNullOrWhiteSpace(ext2))
            ext2 = ".wav";

        job2.Status = "done";
        job2.OutputVocalsPath = $"{baseName2}_vocals{ext2}";
        job2.OutputInstrumentalPath = $"{baseName2}_backsound{ext2}";
        await _db.SaveChangesAsync();

        return Ok(job2);
    }
}
