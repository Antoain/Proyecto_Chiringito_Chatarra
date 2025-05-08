using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocalizacionController : ControllerBase
    {
        private readonly ChChatarra40Context _context;
        public LocalizacionController(ChChatarra40Context context)
        {
            _context = context;
        }

        // GET para obtener Departamentos
        [HttpGet("Departamentos")]
        public async Task<IActionResult> ObtenerDepartamentos()
        {
            var departamentos = await _context.Departamentos.ToListAsync();
            return Ok(departamentos);
        }

        // POST para crear un Departamento
        [HttpPost("Departamentos")]
        public async Task<IActionResult> CrearDepartamento([FromBody] Departamento departamento)
        {
            if (departamento == null || string.IsNullOrEmpty(departamento.Descripcion))
            {
                return BadRequest(new { mensaje = "Datos de departamento incorrectos." });
            }

            _context.Departamentos.Add(departamento);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerDepartamentos), new { id = departamento.IdDepartamento }, departamento);
        }

        // GET para obtener Provincias según idDepartamento
        [HttpGet("Provincias/{idDepartamento}")]
        public async Task<IActionResult> ObtenerProvincias(int idDepartamento)
        {
            var provincias = await _context.Provincia
                .Where(p => p.IdDepartamento == idDepartamento)
                .ToListAsync();
            return Ok(provincias);
        }

        // POST para crear una Provincia
        [HttpPost("Provincias")]
        public async Task<IActionResult> CrearProvincia([FromBody] Provincium provincia)
        {
            if (provincia == null || string.IsNullOrEmpty(provincia.Descripcion) || provincia.IdDepartamento == null)
            {
                return BadRequest(new { mensaje = "Datos de provincia incorrectos." });
            }

            _context.Provincia.Add(provincia);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerProvincias), new { idDepartamento = provincia.IdDepartamento }, provincia);
        }

        // GET para obtener Distritos según idProvincia
        [HttpGet("Distritos/{idProvincia}")]
        public async Task<IActionResult> ObtenerDistritos(int idProvincia)
        {
            var distritos = await _context.Distritos
                .Where(d => d.IdProvincia == idProvincia)
                .ToListAsync();
            return Ok(distritos);
        }

        // POST para crear un Distrito.
        [HttpPost("Distritos")]
        public async Task<IActionResult> CrearDistrito([FromBody] Distrito distrito)
        {
            if (distrito == null || string.IsNullOrEmpty(distrito.Descripcion) || distrito.IdProvincia == null)
            {
                return BadRequest(new { mensaje = "Datos de distrito incorrectos." });
            }

            _context.Distritos.Add(distrito);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ObtenerDistritos), new { idProvincia = distrito.IdProvincia }, distrito);
        }
    }
}
