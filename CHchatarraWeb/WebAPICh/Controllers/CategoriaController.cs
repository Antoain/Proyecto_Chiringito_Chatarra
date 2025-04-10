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
        [HttpGet("Obtener Todas las Categoria")]
        public async Task<ActionResult<IEnumerable<Categorium>>> GetCategorias()
        {
            var categorias = await _categoriaDAO.ObtenerCategoriasAsync();
            return Ok(categorias);
        }

        // GET: api/Categoria/Obtener Categoria por ID/{id}
        [HttpGet("Obtener Categoria por ID/{id}")]
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
        [HttpPost("Crear Categorias")]
        public async Task<IActionResult> PostCategoria(Categorium categorium)
        {
            await _categoriaDAO.CrearCategoriaAsync(categorium);
            return CreatedAtAction(nameof(GetCategoria), new { id = categorium.IdCategoria }, categorium);
        }

        // PUT: api/Categoria/Editar Categoria/{id}
        [HttpPut("Editar Categoria/{id}")]
        public async Task<IActionResult> PutCategoria(int id, Categorium categorium)
        {
            if (id != categorium.IdCategoria)
            {
                return BadRequest();
            }

            await _categoriaDAO.ActualizarCategoriaAsync(categorium);
            return NoContent();
        }

        // DELETE: api/Categoria/Eliminar Categoria por ID/{id}
        [HttpDelete("Eliminar Categoria por ID/{id}")]
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
    }
}
