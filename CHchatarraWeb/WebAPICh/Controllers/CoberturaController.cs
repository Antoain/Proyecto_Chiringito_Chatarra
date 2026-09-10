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
    public class CoberturaController : ControllerBase
    {
        private readonly CoberturaTiendaDAO _coberturaDAO;

        public CoberturaController(
            CoberturaTiendaDAO coberturaDAO)
        {
            _coberturaDAO = coberturaDAO;
        }

        // ==========================================
        // OBTENER MIS COBERTURAS
        // ==========================================

        [HttpGet("MisCoberturas")]
        public async Task<IActionResult> MisCoberturas()
        {
            if (!ObtenerIdVendedor(out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }

            var coberturas =
                await _coberturaDAO
                    .ObtenerPorVendedorAsync(idVendedor);

            var resultado = coberturas.Select(c => new
            {
                c.IdCobertura,

                c.IdTienda,

                Tienda =
                    c.IdTiendaNavigation?.NombreNegocio,

                c.IdDistrito,

                Distrito =
                     c.IdDistritoNavigation?.Descripcion,

                c.CostoEnvio,

                c.Activo,

                c.FechaRegistro
            });

            return Ok(resultado);
        }


        // ==========================================
        // CREAR COBERTURA
        // ==========================================

        [HttpPost]
        public async Task<IActionResult> Crear(
            [FromBody] CoberturaTiendaRequest request)
        {
            if (!ObtenerIdVendedor(out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }

            if (request == null ||
                request.IdTienda <= 0 ||
                request.IdDistrito <= 0 ||
                request.CostoEnvio < 0)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos de cobertura no son válidos."
                });
            }

            bool tiendaPropia =
                await _coberturaDAO
                    .TiendaPerteneceAVendedorAsync(
                        request.IdTienda,
                        idVendedor);

            if (!tiendaPropia)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para configurar esta tienda."
                });
            }

            if (!await _coberturaDAO
                .ExisteDistritoAsync(request.IdDistrito))
            {
                return BadRequest(new
                {
                    mensaje = "El distrito seleccionado no existe."
                });
            }

            if (await _coberturaDAO.ExisteCoberturaAsync(
                request.IdTienda,
                request.IdDistrito))
            {
                return BadRequest(new
                {
                    mensaje =
                        "La tienda ya tiene configurada una cobertura para este distrito."
                });
            }

            var cobertura = new CoberturaTienda
            {
                IdTienda = request.IdTienda,
                IdDistrito = request.IdDistrito,
                CostoEnvio = request.CostoEnvio,
                Activo = true,
                FechaRegistro = DateTime.Now
            };

            await _coberturaDAO.CrearAsync(cobertura);

            return Ok(new
            {
                mensaje = "Cobertura creada correctamente.",
                cobertura.IdCobertura,
                cobertura.IdTienda,
                cobertura.IdDistrito,
                cobertura.CostoEnvio,
                cobertura.Activo
            });
        }


        // ==========================================
        // ACTUALIZAR COBERTURA
        // ==========================================

        [HttpPut("{idCobertura}")]
        public async Task<IActionResult> Actualizar(
            int idCobertura,
            [FromBody] ActualizarCoberturaRequest request)
        {
            if (!ObtenerIdVendedor(out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }

            if (request == null ||
                request.CostoEnvio < 0)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos no son válidos."
                });
            }

            var cobertura =
                await _coberturaDAO
                    .ObtenerPorIdAsync(idCobertura);

            if (cobertura == null)
            {
                return NotFound(new
                {
                    mensaje = "La cobertura no existe."
                });
            }

            if (cobertura.IdTiendaNavigation == null ||
                cobertura.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar esta cobertura."
                });
            }

            cobertura.CostoEnvio =
                request.CostoEnvio;

            cobertura.Activo =
                request.Activo;

            await _coberturaDAO
                .ActualizarAsync(cobertura);

            return Ok(new
            {
                mensaje =
                    "Cobertura actualizada correctamente.",

                cobertura.IdCobertura,
                cobertura.CostoEnvio,
                cobertura.Activo
            });
        }


        // ==========================================
        // ELIMINAR COBERTURA
        // ==========================================

        [HttpDelete("{idCobertura}")]
        public async Task<IActionResult> Eliminar(
            int idCobertura)
        {
            if (!ObtenerIdVendedor(out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }

            var cobertura =
                await _coberturaDAO
                    .ObtenerPorIdAsync(idCobertura);

            if (cobertura == null)
            {
                return NotFound(new
                {
                    mensaje = "La cobertura no existe."
                });
            }

            if (cobertura.IdTiendaNavigation == null ||
                cobertura.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar esta cobertura."
                });
            }

            await _coberturaDAO
                .EliminarAsync(cobertura);

            return Ok(new
            {
                mensaje =
                    "Cobertura eliminada correctamente."
            });
        }


        // ==========================================
        // OBTENER ID DEL JWT
        // ==========================================

        private bool ObtenerIdVendedor(
            out int idVendedor)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

            return int.TryParse(
                claim,
                out idVendedor);
        }
    }
}