using AudioSeparationApi.Data;
using AudioSeparationApi.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AudioSeparationApi.Controllers.Api;

[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminController(ApplicationDbContext db)
    {
        _db = db;
    }

    private bool IsAdmin(int? userId)
    {
        if (!userId.HasValue) return false;
        var user = _db.Users.FirstOrDefault(u => u.Id == userId.Value);
        return user?.Role == "Admin";
    }

    // ====== USERS ======
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int userId)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var users = await _db.Users.Select(u => new { u.Id, u.Email, u.Role, u.CreatedAt }).ToListAsync();
            return Ok(users);
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromQuery] int userId, [FromBody] CreateUserDto dto)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return BadRequest("User already exists");
            
            var user = new User { Email = dto.Email, PasswordHash = Hash(dto.Password), Role = dto.Role ?? "User" };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.Email, user.Role });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser([FromQuery] int userId, int id, [FromBody] UpdateUserDto dto)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            
            if (!string.IsNullOrEmpty(dto.Email) && dto.Email != user.Email)
            {
                if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                    return BadRequest("Email already exists");
                user.Email = dto.Email;
            }
            if (!string.IsNullOrEmpty(dto.Role)) user.Role = dto.Role;
            if (!string.IsNullOrEmpty(dto.Password)) user.PasswordHash = Hash(dto.Password);
            
            await _db.SaveChangesAsync();
            return Ok(new { user.Id, user.Email, user.Role });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser([FromQuery] int userId, int id)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null) return NotFound();
            if (user.Id == userId) return BadRequest("Cannot delete yourself");
            
            _db.Users.Remove(user);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ====== GUEST IDENTITIES ======
    [HttpGet("guest-identities")]
    public async Task<IActionResult> GetGuestIdentities([FromQuery] int userId)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var guests = await _db.GuestIdentities.ToListAsync();
            return Ok(guests);
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpDelete("guest-identities/{id}")]
    public async Task<IActionResult> DeleteGuestIdentity([FromQuery] int userId, int id)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var guest = await _db.GuestIdentities.FindAsync(id);
            if (guest == null) return NotFound();
            _db.GuestIdentities.Remove(guest);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ====== AUDIO JOBS ======
    [HttpGet("audio-jobs")]
    public async Task<IActionResult> GetAudioJobs([FromQuery] int userId)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var jobs = await _db.AudioJobs
                .Select(j => new { 
                    j.Id, j.UserId, j.GuestId, j.InputPath, j.Status, j.CreatedAt,
                    UserEmail = j.User == null ? null : j.User.Email
                })
                .ToListAsync();
            return Ok(jobs);
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    [HttpDelete("audio-jobs/{id}")]
    public async Task<IActionResult> DeleteAudioJob([FromQuery] int userId, int id)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            var job = await _db.AudioJobs.FindAsync(id);
            if (job == null) return NotFound();
            _db.AudioJobs.Remove(job);
            await _db.SaveChangesAsync();
            return Ok(new { message = "Deleted" });
        }
        catch (Exception ex) { return StatusCode(500, new { error = ex.Message }); }
    }

    // ====== SQL EXECUTOR ======
    [HttpPost("execute-sql")]
    public async Task<IActionResult> ExecuteSql([FromQuery] int userId, [FromBody] SqlQuery query)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            if (string.IsNullOrWhiteSpace(query.Sql))
                return BadRequest("SQL query is required.");

            var sql = query.Sql.Trim().ToUpper();
            if (!sql.StartsWith("SELECT") && !sql.StartsWith("CREATE") && !sql.StartsWith("DROP") &&
                !sql.StartsWith("ALTER") && !sql.StartsWith("INSERT") && !sql.StartsWith("UPDATE") &&
                !sql.StartsWith("DELETE") && !sql.StartsWith("TRUNCATE") && !sql.StartsWith("SET"))
                return BadRequest("Only SELECT, CREATE, DROP, ALTER, INSERT, UPDATE, DELETE, TRUNCATE, SET are allowed.");

            if (sql.StartsWith("SELECT"))
            {
                var result = await _db.Database.SqlQueryRaw<dynamic>(query.Sql).ToListAsync();
                return Ok(new { success = true, data = result, message = $"Query executed. Rows: {result.Count}" });
            }
            else
            {
                var rowsAffected = await _db.Database.ExecuteSqlRawAsync(query.Sql);
                return Ok(new { success = true, rowsAffected = rowsAffected, message = $"Query executed. Rows affected: {rowsAffected}" });
            }
        }
        catch (Exception ex) { return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    [HttpPost("recreate-guest-table")]
    public async Task<IActionResult> RecreateGuestTable([FromQuery] int userId)
    {
        if (!IsAdmin(userId)) return Forbid();
        try
        {
            await _db.Database.ExecuteSqlRawAsync("DROP TABLE IF EXISTS GuestIdentities");
            await _db.Database.ExecuteSqlRawAsync(@"
                CREATE TABLE GuestIdentities (
                    Id INT PRIMARY KEY AUTO_INCREMENT,
                    Token VARCHAR(255) NOT NULL UNIQUE,
                    CreatedAt DATETIME NOT NULL,
                    ExpiresAt DATETIME NOT NULL,
                    DailyLimit INT NOT NULL,
                    UsedToday INT NOT NULL,
                    LastResetDate DATETIME NULL
                )
            ");
            return Ok(new { success = true, message = "GuestIdentities table recreated successfully." });
        }
        catch (Exception ex) { return StatusCode(500, new { success = false, error = ex.Message }); }
    }

    private static string Hash(string input)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        return Convert.ToHexString(sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(input)));
    }
}

public record SqlQuery(string Sql);
public record CreateUserDto(string Email, string Password, string? Role);
public record UpdateUserDto(string? Email, string? Password, string? Role);
