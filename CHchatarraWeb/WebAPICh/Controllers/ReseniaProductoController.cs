using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReseniaProductoController : ControllerBase
    {
        private readonly RenseniaProductoDAO _resenasDao;

        public ReseniaProductoController(RenseniaProductoDAO resenasDao)
        {
            _resenasDao = resenasDao;
        }

        // GET: api/ResenasProducto/ObtenerResenas/{idProducto}
        [HttpGet("ObtenerResenas/{idProducto}")]
        public async Task<IActionResult> ObtenerResenas(int idProducto)
        {
            List<object> resenas = await _resenasDao.ObtenerResenasDTOPorProducto(idProducto);
            if (resenas == null || !resenas.Any())
            {
                return NotFound(new { mensaje = "No se encontraron reseñas para este producto." });
            }
            return Ok(resenas);
        }

        // POST: api/ResenasProducto/Agregar
        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarResena([FromBody] ResenasProducto resena)
        {
            var resultado = await _resenasDao.AgregarResena(resena);
            return resultado
                ? Ok(new { mensaje = "Reseña agregada exitosamente." })
                : BadRequest(new { mensaje = "Error al agregar la reseña." });
        }
    }
}
