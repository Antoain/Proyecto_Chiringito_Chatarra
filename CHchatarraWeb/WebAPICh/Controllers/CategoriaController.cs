using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Mvc;
using ChiringuitoCH_Data.DAO;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class CategoriaController : Controller
    {
        private readonly CategoriaDAO _categoriaDAO;

        public CategoriaController(CategoriaDAO categoriaDAO)
        {
            _categoriaDAO = categoriaDAO;
        }

        // GET: api/Categoria/Obtener Todas las Categoria
        [HttpGet("ObtenerCategorias")]
        public async Task<ActionResult<IEnumerable<Categorium>>> GetCategorias()
        {
            var categorias = await _categoriaDAO.ObtenerCategoriasAsync();
            return Ok(categorias);
        }

        // GET: api/Categoria/Obtener Categoria por ID/{id}
        [HttpGet("ObtenerPorID{id}")]
        public async Task<ActionResult<Categorium>> GetCategoria(int id)
        {
            var categoria = await _categoriaDAO.ObtenerCategoriaPorIdAsync(id);
            if (categoria == null)
            {
                return NotFound();
            }
            return Ok(categoria);
        }

        // POST: api/Categoria/Crear Categorias
        [HttpPost("PostCategorias")]
        public async Task<IActionResult> PostCategoria(Categorium categorium)
        {
            await _categoriaDAO.CrearCategoriaAsync(categorium);
            return CreatedAtAction(nameof(GetCategoria), new { id = categorium.IdCategoria }, categorium);
        }

        // PUT: api/Categoria/Editar Categoria/{id}
        [HttpPut("Editar")]
        public async Task<IActionResult> PutCategoria(int id, [FromBody] Categorium categorium)
        {
            if (id != categorium.IdCategoria)
            {
                return BadRequest(new { mensaje = "El ID en la URL no coincide con el ID de la categoría enviada." });
            }

            var categoriaExistente = await _categoriaDAO.ObtenerCategoriaPorIdAsync(id);
            if (categoriaExistente == null)
            {
                return NotFound(new { mensaje = "La categoría especificada no existe." });
            }

            categoriaExistente.Descripcion = !string.IsNullOrEmpty(categorium.Descripcion) ? categorium.Descripcion : categoriaExistente.Descripcion;
            categoriaExistente.Activo = categorium.Activo; // Actualizamos el estado sin verificaciones adicionales.

            await _categoriaDAO.ActualizarCategoriaAsync(categoriaExistente);

            return Ok(new { mensaje = "Categoría actualizada correctamente." });
        }


        // DELETE: api/Categoria/Eliminar Categoria por ID/{id}
        [HttpDelete("Delete{id}")]
        public async Task<IActionResult> DeleteCategoria(int id)
        {
            var categoria = await _categoriaDAO.ObtenerCategoriaPorIdAsync(id);
            if (categoria == null)
            {
                return NotFound();
            }

            await _categoriaDAO.EliminarCategoriaAsync(id);
            return NoContent();
        }

        // GET: api/Categoria/ObtenerProductosPorCategoria/{id}
        [HttpGet("ObtenerProductosPorCategoria/{idCategoria}")]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductosPorCategoria(int idCategoria)
        {
            var productos = await _categoriaDAO.ObtenerProductosPorCategoriaAsync(idCategoria);

            if (productos == null || !productos.Any())
            {
                return NotFound(new { mensaje = "No se encontraron productos para esta categoría." });
            }

            return Ok(productos);
        }

    }
}
