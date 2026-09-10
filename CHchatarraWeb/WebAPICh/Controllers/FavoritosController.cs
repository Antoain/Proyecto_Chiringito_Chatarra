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
    public class FavoritosController : ControllerBase
    {
        private readonly FavoritosDAO _favoritosDAO;
        private readonly ProductosDAO _productoDAO;

        public FavoritosController(
            FavoritosDAO favoritosDAO,
            ProductosDAO productoDAO)
        {
            _favoritosDAO = favoritosDAO;
            _productoDAO = productoDAO;
        }

        // ==========================================
        // OBTENER MIS FAVORITOS
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpGet("ObtenerFavoritos")]
        public async Task<IActionResult> ObtenerFavoritos()
        {
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

            var favoritos =
                await _favoritosDAO
                    .ObtenerFavoritosPorUsuario(
                        idUsuario
                    );

            var resultado =
                favoritos.Select(f => new
                {
                    f.IdFavorito,
                    f.IdProducto,

                    Producto = f.IdProductoNavigation == null
                        ? null
                        : new
                        {
                            f.IdProductoNavigation.IdProducto,
                            f.IdProductoNavigation.Nombre,
                            f.IdProductoNavigation.Descripcion,
                            f.IdProductoNavigation.Precio,
                            f.IdProductoNavigation.Stock,
                            f.IdProductoNavigation.RutaImagen,
                            f.IdProductoNavigation.Activo
                        }
                })
                .ToList();

            return Ok(resultado);
        }

        // ==========================================
        // AGREGAR FAVORITO
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarFavorito(
            [FromBody] AgregarFavoritoRequest request)
        {
            if (request == null ||
                request.IdProducto <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "Producto inválido."
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
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        request.IdProducto
                    );

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            if (producto.Activo != true)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto no está disponible."
                });
            }

            var existeFavorito =
                await _favoritosDAO.ExisteFavoritoAsync(
                    idUsuario,
                    request.IdProducto
                );

            if (existeFavorito)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Este producto ya está en favoritos."
                });
            }

            var favorito = new Favorito
            {
                IdUsuario = idUsuario,
                IdProducto = request.IdProducto
            };

            await _favoritosDAO
                .AgregarFavoritoAsync(favorito);

            return Ok(new
            {
                mensaje =
                    "Producto agregado a favoritos."
            });
        }

        // ==========================================
        // ELIMINAR FAVORITO
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpDelete("Eliminar/{idFavorito}")]
        public async Task<IActionResult> EliminarFavorito(
            int idFavorito)
        {
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

            var favorito =
                await _favoritosDAO
                    .ObtenerFavoritoPorIdAsync(
                        idFavorito
                    );

            if (favorito == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El favorito no existe."
                });
            }

            if (favorito.IdUsuario != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar este favorito."
                });
            }

            await _favoritosDAO
                .EliminarFavorito(idFavorito);

            return Ok(new
            {
                mensaje =
                    "Producto eliminado de favoritos."
            });
        }
    }
}