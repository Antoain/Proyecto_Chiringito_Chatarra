using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CarritoController : ControllerBase
    {
        private readonly CarritoDAO _carritoDao;

        public CarritoController(CarritoDAO carritoDao)
        {
            _carritoDao = carritoDao;
        }

        [HttpGet("ObtenerCarrito/{idUsuario}")]
        public async Task<IActionResult> ObtenerCarrito(int idUsuario)
        {
            var carrito = await _carritoDao.ObtenerCarritoPorUsuario(idUsuario);
            if (!carrito.Any()) return NotFound(new { mensaje = "El carrito está vacío." });

            return Ok(carrito);
        }

        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarAlCarrito([FromBody] Carrito carrito)
        {
            var resultado = await _carritoDao.AgregarAlCarrito(carrito);
            return resultado ? Ok(new { mensaje = "Producto agregado al carrito." }) : BadRequest(new { mensaje = "El producto no existe." });
        }

        public class CantidadRequest
        {
            public int Cantidad { get; set; }
        }

        [HttpPut("ActualizarCantidad/{idCarrito}")]
        public async Task<IActionResult> ActualizarCantidad(int idCarrito, [FromBody] CantidadRequest request)
        {
            if (request == null || request.Cantidad < 1)
            {
                return BadRequest(new { mensaje = "Formato de cantidad incorrecto." });
            }

            var resultado = await _carritoDao.ActualizarCantidadCarrito(idCarrito, request.Cantidad);
            return resultado ? Ok(new { mensaje = "Cantidad actualizada correctamente." }) : NotFound(new { mensaje = "No se encontró el producto en el carrito." });
        }






        [HttpDelete("Eliminar/{idCarrito}")]
        public async Task<IActionResult> EliminarDelCarrito(int idCarrito)
        {
            var resultado = await _carritoDao.EliminarDelCarrito(idCarrito);
            return resultado ? Ok(new { mensaje = "Producto eliminado del carrito." }) : NotFound(new { mensaje = "No existe ese producto en el carrito." });
        }
    }
}
