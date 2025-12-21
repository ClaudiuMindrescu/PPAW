using AudioSeparationApi.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class PlansController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public PlansController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetPlans()
    {
        var plans = await _db.Plans.OrderBy(p => p.Price).ToListAsync();
        return Ok(plans);
    }
}
