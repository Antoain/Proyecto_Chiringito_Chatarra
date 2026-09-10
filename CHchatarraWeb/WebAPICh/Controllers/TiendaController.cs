using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using ChiringuitoCH_Data.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TiendaController : ControllerBase
    {
        private readonly TiendaDAO _tiendaDAO;
        private readonly CategoriaDAO _categoriaDAO;

        public TiendaController(
            TiendaDAO tiendaDAO,
            CategoriaDAO categoriaDAO)
        {
            _tiendaDAO = tiendaDAO;
            _categoriaDAO = categoriaDAO;
        }


        // ==========================================
        // OBTENER TODAS LAS TIENDAS - PÚBLICO
        // ==========================================

        [HttpGet("ObtenerTiendas")]
        public async Task<ActionResult<IEnumerable<Tienda>>> GetTiendas()
        {
            var tiendas = await _tiendaDAO.ObtenerTiendasAsync();

            return Ok(tiendas);
        }


        // ==========================================
        // OBTENER TIENDA POR ID - PÚBLICO
        // ==========================================

        [HttpGet("ObtenerTienda/{id}")]
        public async Task<ActionResult<Tienda>> GetTienda(int id)
        {
            var tienda =
                await _tiendaDAO.ObtenerTiendaPorIdAsync(id);

            if (tienda == null)
            {
                return NotFound(new
                {
                    mensaje = "La tienda no existe."
                });
            }

            return Ok(tienda);
        }


        // ==========================================
        // CREAR TIENDA - SOLO VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost("CrearTienda")]
        public async Task<IActionResult> PostTienda(
            [FromBody] CrearTiendaRequest request)
        {
            // Validar datos básicos
            if (request == null ||
                string.IsNullOrWhiteSpace(request.NombreNegocio))
            {
                return BadRequest(new
                {
                    mensaje = "Datos inválidos para la tienda."
                });
            }


            // Obtener el IdUsuario desde el JWT
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }


            // Comprobar que la categoría exista
            var categoria =
                await _categoriaDAO.ObtenerCategoriaPorIdAsync(
                    request.IdCategoria
                );

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje = "La categoría seleccionada no existe."
                });
            }


            // Crear la tienda
            // El IdVendedor NO viene del frontend.
            // Se obtiene directamente del JWT.
            var tienda = new Tienda
            {
                IdVendedor = idVendedor,

                NombreNegocio = request.NombreNegocio,
                RegistroNegocio = request.RegistroNegocio,
                Horario = request.Horario,
                FotoFachadaUrl = request.FotoFachadaUrl,
                IdCategoria = request.IdCategoria,
                Eslogan = request.Eslogan,
                NumeroContacto = request.NumeroContacto,
                FacebookUrl = request.FacebookUrl,
                PaginaWebUrl = request.PaginaWebUrl,
                CuentaEnvio = request.CuentaEnvio,

                FechaRegistro =
                    DateOnly.FromDateTime(DateTime.UtcNow)
            };


            await _tiendaDAO.CrearTiendaAsync(tienda);


            return CreatedAtAction(
                nameof(GetTienda),
                new { id = tienda.IdTienda },
                new
                {
                    tienda.IdTienda,
                    tienda.IdVendedor,
                    tienda.NombreNegocio,
                    tienda.RegistroNegocio,
                    tienda.Horario,
                    tienda.FotoFachadaUrl,
                    tienda.IdCategoria,
                    tienda.Eslogan,
                    tienda.NumeroContacto,
                    tienda.FacebookUrl,
                    tienda.PaginaWebUrl,
                    tienda.CuentaEnvio,
                    tienda.FechaRegistro
                }
            );
        }


        // ==========================================
        // EDITAR TIENDA
        // VENDEDOR PROPIETARIO O ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpPut("Editar/{id}")]
        public async Task<IActionResult> PutTienda(
    int id,
    [FromBody] EditarTiendaRequest request)
        {
            var tiendaExistente =
                await _tiendaDAO.ObtenerTiendaPorIdAsync(id);

            if (tiendaExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "La tienda especificada no existe."
                });
            }

            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }

            // Si es Vendedor, solo puede editar sus propias tiendas
            if (rol == "Vendedor" &&
                tiendaExistente.IdVendedor != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje = "No tiene permiso para editar esta tienda."
                });
            }

            // Validar categoría
            var categoria =
                await _categoriaDAO.ObtenerCategoriaPorIdAsync(
                    request.IdCategoria
                );

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje = "La categoría seleccionada no existe."
                });
            }

            // El propietario NO se modifica
            tiendaExistente.NombreNegocio =
                !string.IsNullOrWhiteSpace(request.NombreNegocio)
                    ? request.NombreNegocio
                    : tiendaExistente.NombreNegocio;

            tiendaExistente.RegistroNegocio =
                !string.IsNullOrWhiteSpace(request.RegistroNegocio)
                    ? request.RegistroNegocio
                    : tiendaExistente.RegistroNegocio;

            tiendaExistente.Horario =
                !string.IsNullOrWhiteSpace(request.Horario)
                    ? request.Horario
                    : tiendaExistente.Horario;

            tiendaExistente.FotoFachadaUrl =
                !string.IsNullOrWhiteSpace(request.FotoFachadaUrl)
                    ? request.FotoFachadaUrl
                    : tiendaExistente.FotoFachadaUrl;

            tiendaExistente.IdCategoria =
                request.IdCategoria;

            tiendaExistente.Eslogan =
                !string.IsNullOrWhiteSpace(request.Eslogan)
                    ? request.Eslogan
                    : tiendaExistente.Eslogan;

            tiendaExistente.NumeroContacto =
                !string.IsNullOrWhiteSpace(request.NumeroContacto)
                    ? request.NumeroContacto
                    : tiendaExistente.NumeroContacto;

            tiendaExistente.FacebookUrl =
                !string.IsNullOrWhiteSpace(request.FacebookUrl)
                    ? request.FacebookUrl
                    : tiendaExistente.FacebookUrl;

            tiendaExistente.PaginaWebUrl =
                !string.IsNullOrWhiteSpace(request.PaginaWebUrl)
                    ? request.PaginaWebUrl
                    : tiendaExistente.PaginaWebUrl;

            tiendaExistente.CuentaEnvio =
                request.CuentaEnvio;

            await _tiendaDAO.ActualizarTiendaAsync(
                tiendaExistente
            );

            return Ok(new
            {
                mensaje = "Tienda actualizada correctamente."
            });
        }


        // ==========================================
        // ELIMINAR TIENDA
        // VENDEDOR PROPIETARIO O ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpDelete("EliminarTienda/{id}")]
        public async Task<IActionResult> DeleteTienda(int id)
        {
            var tienda =
                await _tiendaDAO.ObtenerTiendaPorIdAsync(id);

            if (tienda == null)
            {
                return NotFound(new
                {
                    mensaje = "La tienda especificada no existe."
                });
            }


            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }


            // Vendedor solo puede eliminar SUS tiendas
            if (rol == "Vendedor" &&
                tienda.IdVendedor != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar esta tienda."
                });
            }


            await _tiendaDAO.EliminarTiendaAsync(id);

            return NoContent();
        }


        // ==========================================
        // OBTENER TIENDAS DE UN VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpGet("ObtenerTiendasPorVendedor/{idVendedor}")]
        public async Task<ActionResult<IEnumerable<Tienda>>>
            ObtenerTiendasPorVendedor(int idVendedor)
        {
            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }


            // Un vendedor solo puede consultar SUS tiendas
            if (rol == "Vendedor" &&
                idVendedor != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para consultar estas tiendas."
                });
            }


            var tiendas =
                await _tiendaDAO
                    .ObtenerTiendasPorVendedorAsync(idVendedor);


            if (tiendas == null || !tiendas.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontraron tiendas para este vendedor."
                });
            }


            return Ok(tiendas);
        }
    }
}