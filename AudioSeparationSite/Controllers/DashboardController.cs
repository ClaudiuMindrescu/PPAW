using AudioSeparationSite.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationSite.Controllers;

[AllowAnonymous]
public class DashboardController(ApplicationDbContext db) : Controller
{
    public async Task<IActionResult> Index()
    {
        var plans = await db.Plans.OrderBy(p => p.Price).ToListAsync();
        return View(plans);
    }
}