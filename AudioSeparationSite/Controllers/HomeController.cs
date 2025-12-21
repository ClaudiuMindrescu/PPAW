using AudioSeparationSite.Data;
using AudioSeparationSite.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Security.Claims;

namespace AudioSeparationSite.Controllers;

[Microsoft.AspNetCore.Authorization.Authorize]
public class HomeController : Controller
{
    // For demo we use a static user (id=1). Replace with real auth later.

    private readonly ApplicationDbContext db;
    private readonly IWebHostEnvironment env;
    private readonly SubscriptionService _subs;

    public HomeController(ApplicationDbContext db, IWebHostEnvironment env, SubscriptionService subs)
    {
        this.db = db;
        this.env = env;
        _subs = subs;
    }
    public async Task<IActionResult> Index()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var (sub, plan) = await _subs.GetCurrentForUserAsync(userId);

    var today = DateOnly.FromDateTime(DateTime.UtcNow);
    var usage = await db.UsageQuotas
        .FirstOrDefaultAsync(u => u.UserId == userId && u.Day == today);

    var used = usage?.UsedCount ?? 0;
    var limit = plan?.DailyLimit ?? 0;

    ViewData["PlanName"] = plan?.Name ?? "No Plan";
    ViewData["Limit"] = limit;
    ViewData["Used"] = used;

    var jobs = await db.AudioJobs
        .Where(j => j.UserId == userId)
        .OrderByDescending(j => j.CreatedAt)
        .Take(10)
        .ToListAsync();

    return View(jobs);
}

[Authorize]
public async Task<IActionResult> Processing(int id)
{
    var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    var job = await db.AudioJobs
        .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

    if (job == null)
    {
        TempData["Error"] = "Job inexistent.";
        return RedirectToAction("Index");
    }

    return View(job);
}

[Authorize]
public async Task<IActionResult> Finalize(int id)
{
    var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    var job = await db.AudioJobs
        .FirstOrDefaultAsync(j => j.Id == id && j.UserId == userId);

    if (job == null)
    {
        TempData["Error"] = "Job inexistent.";
        return RedirectToAction("Index");
    }

    if (job.Status != "done")
    {
        var originalName = job.InputPath ?? "audio.wav";
        var baseName = Path.GetFileNameWithoutExtension(originalName);
        var ext = Path.GetExtension(originalName);
        if (string.IsNullOrWhiteSpace(ext))
        {
            ext = ".wav";
        }

        job.Status = "done";
        job.OutputVocalsPath = $"{baseName}_vocals{ext}";
        job.OutputInstrumentalPath = $"{baseName}_backsound{ext}";

        await db.SaveChangesAsync();
    }

    TempData["Message"] = "Fișier procesat (simulare).";
    return RedirectToAction("Index");
}

    


}