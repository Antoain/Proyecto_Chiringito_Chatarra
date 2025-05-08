using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiendaController : ControllerBase
    {
        private readonly TiendaDAO _tiendaDAO;

        public TiendaController(TiendaDAO tiendaDAO)
        {
            _tiendaDAO = tiendaDAO;
        }

        // GET: api/Tienda/ObtenerTiendas
        [HttpGet("ObtenerTiendas")]
        public async Task<ActionResult<IEnumerable<Tienda>>> GetTiendas()
        {
            var tiendas = await _tiendaDAO.ObtenerTiendasAsync();
            return Ok(tiendas);
        }

        // GET: api/Tienda/ObtenerTienda/{id}
        [HttpGet("ObtenerTienda/{id}")]
        public async Task<ActionResult<Tienda>> GetTienda(int id)
        {
            var tienda = await _tiendaDAO.ObtenerTiendaPorIdAsync(id);
            if (tienda == null)
                return NotFound(new { mensaje = "La tienda no existe." });
            return Ok(tienda);
        }

        // POST: api/Tienda/CrearTienda
        [HttpPost("CrearTienda")]
        public async Task<IActionResult> PostTienda([FromBody] Tienda tienda)
        {
            if (tienda == null || string.IsNullOrEmpty(tienda.NombreNegocio) || tienda.IdVendedor == 0)
            {
                return BadRequest(new { mensaje = "Datos inválidos para la tienda." });
            }

            await _tiendaDAO.CrearTiendaAsync(tienda);
            return CreatedAtAction(nameof(GetTienda), new { id = tienda.IdTienda }, tienda);
        }


        // PUT: api/Tienda/Editar
        [HttpPut("Editar")]
        public async Task<IActionResult> PutTienda(int id, [FromBody] Tienda tienda)
        {
            if (id != tienda.IdTienda)
            {
                return BadRequest(new { mensaje = "El ID en la URL no coincide con el ID de la tienda enviada." });
            }

            var tiendaExistente = await _tiendaDAO.ObtenerTiendaPorIdAsync(id);
            if (tiendaExistente == null)
            {
                return NotFound(new { mensaje = "La tienda especificada no existe." });
            }

            // Actualizamos solo los campos deseados
            tiendaExistente.IdVendedor = tienda.IdVendedor;
            tiendaExistente.NombreNegocio = !string.IsNullOrEmpty(tienda.NombreNegocio) ? tienda.NombreNegocio : tiendaExistente.NombreNegocio;
            tiendaExistente.Horario = !string.IsNullOrEmpty(tienda.Horario) ? tienda.Horario : tiendaExistente.Horario;
            tiendaExistente.FotoFachadaUrl = !string.IsNullOrEmpty(tienda.FotoFachadaUrl) ? tienda.FotoFachadaUrl : tiendaExistente.FotoFachadaUrl;
            tiendaExistente.IdCategoria = tienda.IdCategoria;
            tiendaExistente.Eslogan = !string.IsNullOrEmpty(tienda.Eslogan) ? tienda.Eslogan : tiendaExistente.Eslogan;
            tiendaExistente.NumeroContacto = !string.IsNullOrEmpty(tienda.NumeroContacto) ? tienda.NumeroContacto : tiendaExistente.NumeroContacto;
            tiendaExistente.FacebookUrl = !string.IsNullOrEmpty(tienda.FacebookUrl) ? tienda.FacebookUrl : tiendaExistente.FacebookUrl;
            tiendaExistente.PaginaWebUrl = !string.IsNullOrEmpty(tienda.PaginaWebUrl) ? tienda.PaginaWebUrl : tiendaExistente.PaginaWebUrl;
            tiendaExistente.CuentaEnvio = tienda.CuentaEnvio;
            tiendaExistente.FechaRegistro = tienda.FechaRegistro;

            await _tiendaDAO.ActualizarTiendaAsync(tiendaExistente);
            return Ok(new { mensaje = "Tienda actualizada correctamente." });
        }

        // DELETE: api/Tienda/EliminarTienda/{id}
        [HttpDelete("EliminarTienda/{id}")]
        public async Task<IActionResult> DeleteTienda(int id)
        {
            var tienda = await _tiendaDAO.ObtenerTiendaPorIdAsync(id);
            if (tienda == null)
                return NotFound(new { mensaje = "La tienda especificada no existe." });

            await _tiendaDAO.EliminarTiendaAsync(id);
            return NoContent();
        }

        // GET: api/Tienda/ObtenerTiendasPorVendedor/{idVendedor}
        [HttpGet("ObtenerTiendasPorVendedor/{idVendedor}")]
        public async Task<ActionResult<IEnumerable<Tienda>>> ObtenerTiendasPorVendedor(int idVendedor)
        {
            var tiendas = await _tiendaDAO.ObtenerTiendasPorVendedorAsync(idVendedor);

            if (tiendas == null || !tiendas.Any())
            {
                return NotFound("No se encontraron tiendas para este vendedor.");
            }

            return Ok(tiendas);
        }



    }
}
