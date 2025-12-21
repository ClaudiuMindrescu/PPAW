using System.Security.Claims;
using AudioSeparationSite.Data;
using AudioSeparationSite.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AudioSeparationSite.Services;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Controllers;

[Authorize]
[Route("upload")]
public class UploadController : Controller
{
     private readonly ApplicationDbContext _db;
    private readonly IWebHostEnvironment _env;
    private readonly SubscriptionService _subs;

    public UploadController(ApplicationDbContext db, IWebHostEnvironment env, SubscriptionService subs)
    {
        _db = db;
        _env = env;
        _subs = subs;
    }

    [HttpPost]
    [RequestSizeLimit(104_857_600)] // 100 MB
    public async Task<IActionResult> Post(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            TempData["Error"] = "Selectează un fișier audio.";
            return RedirectToAction("Index", "Home");
        }

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // 1) Verificăm planul activ
        var (sub, plan) = await _subs.GetCurrentForUserAsync(userId);

if (sub == null || plan == null)
{
    TempData["Error"] = "Nu ai un plan activ.";
    return RedirectToAction("Index", "Home");
}

        if (plan == null)
        {
            TempData["Error"] = "Planul asociat nu există.";
            return RedirectToAction("Index", "Home");
        }

        // 2) Verificare limită zilnică
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var usage = await _db.UsageQuotas
            .FirstOrDefaultAsync(u => u.UserId == userId && u.Day == today);

        var used = usage?.UsedCount ?? 0;
        if (used >= plan.DailyLimit)
        {
            TempData["Error"] = $"Ai atins limita zilnică ({plan.DailyLimit} fișiere).";
            return RedirectToAction("Index", "Home");
        }

        // 3) Salvăm fișierul (doar ca demo)
        var uploads = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads");
        Directory.CreateDirectory(uploads);

        var safeName = Path.GetFileName(file.FileName);
        var uniqueName = $"{Guid.NewGuid()}_{safeName}";
        var fullPath = Path.Combine(uploads, uniqueName);

        using (var stream = System.IO.File.Create(fullPath))
        {
            await file.CopyToAsync(stream);
        }

        // 4) Creăm jobul cu status "processing" (simulare)
        var job = new AudioJob
        {
            UserId = userId,
            InputPath = uniqueName,   // stocăm doar numele, nu linkul complet
            Status = "processing",
            CreatedAt = DateTime.UtcNow
        };

        _db.AudioJobs.Add(job);

        // 5) Updatăm quota
        if (usage == null)
        {
            usage = new UsageQuota
            {
                UserId = userId,
                Day = today,
                UsedCount = 1
            };
            _db.UsageQuotas.Add(usage);
        }
        else
        {
            usage.UsedCount += 1;
        }

        await _db.SaveChangesAsync();

        // 6) Trimitem utilizatorul pe pagina de "Processing"
        return RedirectToAction("Processing", "Home", new { id = job.Id });
    }
}
