using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VendedorController : ControllerBase
    {
        private readonly VendedorDAO _vendedorDAO;

        public VendedorController(VendedorDAO vendedorDAO)
        {
            _vendedorDAO = vendedorDAO;
        }

        // GET: api/Vendedor/ObtenerVendedores
        [Authorize(Roles = "Administrador")]
        [HttpGet("ObtenerVendedores")]
        public async Task<ActionResult<IEnumerable<Vendedore>>> GetVendedores()
        {
            var vendedores =
                await _vendedorDAO.ObtenerVendedoresAsync();

            return Ok(vendedores);
        }


        // GET: api/Vendedor/ObtenerVendedor/1
        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpGet("ObtenerVendedor/{id}")]
        public async Task<ActionResult<Vendedore>> GetVendedor(int id)
        {
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuarioToken))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }

            if (rol == "Vendedor" && idUsuarioToken != id)
            {
                return StatusCode(403, new
                {
                    mensaje = "No tiene permiso para consultar este vendedor."
                });
            }

            var vendedor =
                await _vendedorDAO.ObtenerVendedorPorIdAsync(id);

            if (vendedor == null)
            {
                return NotFound(new
                {
                    mensaje = "El vendedor no existe."
                });
            }

            return Ok(vendedor);
        }

        // POST: api/Vendedor/CrearVendedor
        [Authorize(Roles = "Administrador")]
        [HttpPost("CrearVendedores")]
        public async Task<IActionResult> PostVendedores(
        [FromBody] List<Vendedore> vendedores)
        {
            if (vendedores == null || !vendedores.Any())
            {
                return BadRequest(new
                {
                    mensaje = "Debe enviar una lista de vendedores válida."
                });
            }

            foreach (var vendedor in vendedores)
            {
                var existente =
                    await _vendedorDAO.ObtenerVendedorPorIdAsync(
                        vendedor.IdUsuario
                    );

                if (existente == null)
                {
                    await _vendedorDAO.CrearVendedorAsync(vendedor);
                }
            }

            return Ok(new
            {
                mensaje = "Vendedores agregados correctamente."
            });
        }


        // PUT: api/Vendedor/Editar
        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpPut("Editar")]
        public async Task<IActionResult> PutVendedor(int id, [FromBody] Vendedore vendedor)
        {
            if (id != vendedor.IdUsuario)
            {
                return BadRequest(new
                {
                    mensaje = "El ID en la URL no coincide con el ID del vendedor enviado."
                });
            }

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuarioToken))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }

            if (rol == "Vendedor" && idUsuarioToken != id)
            {
                return StatusCode(403, new
                {
                    mensaje = "No tiene permiso para modificar este vendedor."
                });
            }

            var vendedorExistente =
                await _vendedorDAO.ObtenerVendedorPorIdAsync(id);

            if (vendedorExistente == null)
            {
                return NotFound(new
                {
                    mensaje = "El vendedor especificado no existe."
                });
            }

            vendedorExistente.FechaInicio =
                vendedor.FechaInicio;

            vendedorExistente.Rfc =
                vendedor.Rfc;

            await _vendedorDAO.ActualizarVendedorAsync(
                vendedorExistente
            );

            return Ok(new
            {
                mensaje = "Vendedor actualizado correctamente."
            });
        }

        // DELETE: api/Vendedor/EliminarVendedor/1
        [Authorize(Roles = "Administrador")]
        [HttpDelete("EliminarVendedor/{id}")]
        public async Task<IActionResult> DeleteVendedor(int id)
        {
            var vendedor =
                await _vendedorDAO.ObtenerVendedorPorIdAsync(id);

            if (vendedor == null)
            {
                return NotFound(new
                {
                    mensaje = "El vendedor especificado no existe."
                });
            }

            await _vendedorDAO.EliminarVendedorAsync(id);

            return NoContent();
        }
    }

        


}

