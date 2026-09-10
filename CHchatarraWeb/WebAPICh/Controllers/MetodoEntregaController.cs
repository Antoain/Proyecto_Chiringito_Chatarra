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
    [Authorize(Roles = "Vendedor")]
    public class MetodoEntregaController : ControllerBase
    {
        private readonly MetodoEntregaTiendaDAO
            _metodoEntregaDAO;

        public MetodoEntregaController(
            MetodoEntregaTiendaDAO metodoEntregaDAO)
        {
            _metodoEntregaDAO =
                metodoEntregaDAO;
        }


        // ==========================================
        // MIS MÉTODOS DE ENTREGA
        // ==========================================

        [HttpGet("MisMetodos")]
        public async Task<IActionResult>
            MisMetodos()
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                idUsuarioClaim,
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var metodos =
                await _metodoEntregaDAO
                    .ObtenerPorVendedorAsync(
                        idVendedor);


            return Ok(
                metodos.Select(m => new
                {
                    m.IdMetodoEntrega,

                    m.IdTienda,

                    Tienda =
                        m.IdTiendaNavigation?
                            .NombreNegocio,

                    m.TipoMetodo,

                    m.Activo,

                    m.FechaRegistro
                })
            );
        }


        // ==========================================
        // CREAR MÉTODO
        // ==========================================

        [HttpPost]
        public async Task<IActionResult>
            Crear(
                [FromBody]
                MetodoEntregaTiendaRequest request)
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                idUsuarioClaim,
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            string tipoMetodo =
                request.TipoMetodo?
                    .Trim()
                    .ToUpper()
                ?? "";


            // ======================================
            // VALIDAR TIPO
            // ======================================

            string[] tiposValidos =
            {
                "TIENDA",
                "ALIADO",
                "RECOGER_TIENDA"
            };


            if (!tiposValidos.Contains(
                tipoMetodo))
            {
                return BadRequest(new
                {
                    mensaje =
                        "Tipo de método de entrega inválido."
                });
            }


            // ======================================
            // VALIDAR PROPIEDAD
            // ======================================

            bool pertenece =
                await _metodoEntregaDAO
                    .TiendaPerteneceAVendedorAsync(
                        request.IdTienda,
                        idVendedor);


            if (!pertenece)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para configurar esta tienda."
                });
            }


            // ======================================
            // EVITAR DUPLICADOS
            // ======================================

            bool existe =
                await _metodoEntregaDAO
                    .ExisteMetodoAsync(
                        request.IdTienda,
                        tipoMetodo);


            if (existe)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La tienda ya tiene configurado este método de entrega."
                });
            }


            // ======================================
            // CREAR
            // ======================================

            var metodo =
                new MetodoEntregaTienda
                {
                    IdTienda =
                        request.IdTienda,

                    TipoMetodo =
                        tipoMetodo,

                    Activo =
                        true,

                    FechaRegistro =
                        DateTime.Now
                };


            await _metodoEntregaDAO
                .CrearAsync(metodo);


            return Ok(new
            {
                mensaje =
                    "Método de entrega creado correctamente.",

                metodo.IdMetodoEntrega,

                metodo.IdTienda,

                metodo.TipoMetodo,

                metodo.Activo
            });
        }


        // ==========================================
        // ACTIVAR / DESACTIVAR
        // ==========================================

        [HttpPut("{idMetodoEntrega}")]
        public async Task<IActionResult>
            Actualizar(
                int idMetodoEntrega,
                [FromBody]
                ActualizarMetodoEntregaRequest request)
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                idUsuarioClaim,
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var metodo =
                await _metodoEntregaDAO
                    .ObtenerPorIdAsync(
                        idMetodoEntrega);


            if (metodo == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El método de entrega no existe."
                });
            }


            bool pertenece =
                await _metodoEntregaDAO
                    .TiendaPerteneceAVendedorAsync(
                        metodo.IdTienda,
                        idVendedor);


            if (!pertenece)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar este método."
                });
            }


            metodo.Activo =
                request.Activo;


            await _metodoEntregaDAO
                .ActualizarAsync(metodo);


            return Ok(new
            {
                mensaje =
                    "Método de entrega actualizado correctamente.",

                metodo.IdMetodoEntrega,

                metodo.IdTienda,

                metodo.TipoMetodo,

                metodo.Activo
            });
        }


        // ==========================================
        // ELIMINAR
        // ==========================================

        [HttpDelete("{idMetodoEntrega}")]
        public async Task<IActionResult>
            Eliminar(int idMetodoEntrega)
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(
                idUsuarioClaim,
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var metodo =
                await _metodoEntregaDAO
                    .ObtenerPorIdAsync(
                        idMetodoEntrega);


            if (metodo == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El método de entrega no existe."
                });
            }


            bool pertenece =
                await _metodoEntregaDAO
                    .TiendaPerteneceAVendedorAsync(
                        metodo.IdTienda,
                        idVendedor);


            if (!pertenece)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar este método."
                });
            }


            await _metodoEntregaDAO
                .EliminarAsync(metodo);


            return NoContent();
        }
    }
}