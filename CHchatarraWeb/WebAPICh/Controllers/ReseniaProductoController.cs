using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.DTOs;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReseniaProductoController : ControllerBase
    {
        private readonly RenseniaProductoDAO _resenasDao;
        private readonly ProductosDAO _productoDAO;

        public ReseniaProductoController(
            RenseniaProductoDAO resenasDao,
            ProductosDAO productoDAO)
        {
            _resenasDao = resenasDao;
            _productoDAO = productoDAO;
        }

        // ==========================================
        // OBTENER RESEÑAS DE UN PRODUCTO - PÚBLICO
        // ==========================================

        [HttpGet("ObtenerResenas/{idProducto}")]
        public async Task<IActionResult> ObtenerResenas(int idProducto)
        {
            var resenas =
                await _resenasDao.ObtenerResenasDTOPorProducto(
                    idProducto
                );

            if (resenas == null || !resenas.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontraron reseñas para este producto."
                });
            }

            return Ok(resenas);
        }

        // ==========================================
        // AGREGAR RESEÑA - SOLO CLIENTE
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarResena(
            [FromBody] AgregarResenaRequest request)
        {
            if (request == null ||
                request.IdProducto <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "Datos inválidos."
                });
            }

            if (request.Calificacion < 1 ||
                request.Calificacion > 5)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La calificación debe estar entre 1 y 5."
                });
            }

            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

            if (!int.TryParse(
                idUsuarioClaim,
                out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al usuario."
                });
            }

            var producto =
                await _productoDAO.ObtenerProductoPorIdAsync(
                    request.IdProducto
                );

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            var resena = new ResenasProducto
            {
                IdUsuario = idUsuario,
                IdProducto = request.IdProducto,
                Calificacion = request.Calificacion,
                Comentario = request.Comentario
            };

            var resultado =
                await _resenasDao.AgregarResena(resena);

            if (!resultado)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Error al agregar la reseña."
                });
            }

            return Ok(new
            {
                mensaje =
                    "Reseña agregada exitosamente."
            });
        }
    }
}