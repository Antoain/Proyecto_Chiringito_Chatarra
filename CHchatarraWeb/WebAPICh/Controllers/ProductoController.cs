using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductoController : Controller
    {
        private readonly ProductosDAO _productoDAO;

        public ProductoController(ProductosDAO productoDAO)
        {
            _productoDAO = productoDAO;
        }

        // GET: api/Productos/Obtener Productos
        [HttpGet("Obtener Productos")]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            var productos = await _productoDAO.ObtenerProductosAsync();
            return Ok(productos);
        }

        // GET: api/Productos/Obtener Productos por ID
        [HttpGet("Obtener Productos por ID/{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto = await _productoDAO.ObtenerProductoPorIdAsync(id);
            if (producto == null)
            {
                return NotFound();
            }
            return Ok(producto);
        }

        // POST: api/Productos/Crear Productos
        [HttpPost("Crear Productos")]
        public async Task<IActionResult> PostProducto(Producto producto)
        {
            await _productoDAO.CrearProductoAsync(producto);
            return CreatedAtAction(nameof(GetProducto), new { id = producto.IdProducto }, producto);
        }

        // PUT: api/Productos/Editar Productos/{id}
        [HttpPut("Editar Productos/{id}")]
        public async Task<IActionResult> PutProducto(int id, Producto producto)
        {
            if (id != producto.IdProducto)
            {
                return BadRequest();
            }

            await _productoDAO.ActualizarProductoAsync(producto);
            return NoContent();
        }

        // DELETE: api/Productos/Eliminar por ID/{id}
        [HttpDelete("Eliminar por ID/{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto = await _productoDAO.ObtenerProductoPorIdAsync(id);
            if (producto == null)
            {
                return NotFound();
            }

            await _productoDAO.EliminarProductoAsync(id);
            return NoContent();
        }
    }
}
