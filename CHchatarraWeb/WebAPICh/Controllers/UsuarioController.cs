using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.DTOs;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WebAPICh.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : Controller
    {
        private readonly UsuarioDAO _usuarioDAO;
        private readonly VendedorDAO _vendedorDAO;
        private readonly AuthService _authService;

        public UsuarioController(
            UsuarioDAO usuarioDAO,
            VendedorDAO vendedorDAO,
            AuthService authService)
        {
            _usuarioDAO = usuarioDAO;
            _vendedorDAO = vendedorDAO;
            _authService = authService;
        }

        // GET: api/Usuario/ObtenerUsuarios
        [Authorize(Roles = "Administrador")]
        [HttpGet("ObtenerUsuarios")]
        public async Task<ActionResult<IEnumerable<Usuario>>> GetUsuarios()
        {
            var usuarios = await _usuarioDAO.ObtenerUsuariosAsync();

            var usuariosFiltrados = usuarios.Select(u => new
            {
                IdUsuario = u.IdUsuario,
                Nombres = u.Nombres,
                Apellidos = u.Apellidos,
                Correo = u.Correo,
                Rol = u.Rol,
                FechaRegistro = u.FechaRegistro
            }).ToList();

            return Ok(usuariosFiltrados);
        }



        // GET: api/Usuario/5
        [Authorize]
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
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

            if (rol != "Administrador" && idUsuarioToken != id)
            {
                return StatusCode(403, new
                {
                    mensaje = "No tiene permiso para consultar este usuario."
                });
            }

            var usuario =
                await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado."
                });
            }

            return Ok(new
            {
                usuario.IdUsuario,
                usuario.Nombres,
                usuario.Apellidos,
                usuario.Correo,
                usuario.Rol,
                usuario.FechaRegistro
            });
        }


        // POST: api/Usuario/PostUsuario
        [Authorize(Roles = "Administrador")]
        [HttpPost("PostUsuario")]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            if (usuario == null ||
                string.IsNullOrWhiteSpace(usuario.Nombres) ||
                string.IsNullOrWhiteSpace(usuario.Apellidos) ||
                string.IsNullOrWhiteSpace(usuario.Correo) ||
                string.IsNullOrWhiteSpace(usuario.Clave))
            {
                return BadRequest(new
                {
                    mensaje = "Todos los campos son obligatorios."
                });
            }

            if (usuario.Rol != "Cliente" &&
                usuario.Rol != "Vendedor" &&
                usuario.Rol != "Administrador")
            {
                return BadRequest(new
                {
                    mensaje = "El rol indicado no es válido."
                });
            }

            var existente = await _usuarioDAO
                .ObtenerUsuarioPorCorreoAsync(usuario.Correo);

            if (existente != null)
            {
                return Conflict(new
                {
                    mensaje = "Ya existe un usuario con ese correo."
                });
            }


            usuario.Clave = _authService.HashPassword(
                usuario,
                usuario.Clave
            );

            await _usuarioDAO.AgregarUsuarioAsync(usuario);

            return CreatedAtAction(
                nameof(GetUsuario),
                new { id = usuario.IdUsuario },
                new
                {
                    usuario.IdUsuario,
                    usuario.Nombres,
                    usuario.Apellidos,
                    usuario.Correo,
                    usuario.Rol,
                    usuario.FechaRegistro
                }
            );
        }



        // PUT: Editar usuario
        [Authorize]
        [HttpPut("Editar")]
        public async Task<IActionResult> PutUsuario(
    [FromQuery] int id,
    [FromBody] ActualizarUsuarioDTO datos)
        {
            if (datos == null || id != datos.IdUsuario)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos del usuario no coinciden."
                });
            }

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            var rolActual =
                User.FindFirst(ClaimTypes.Role)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idToken))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }

            if (rolActual != "Administrador" && idToken != id)
            {
                return Forbid();
            }

            var usuario =
                await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado."
                });
            }

            if (!string.IsNullOrWhiteSpace(datos.Nombres))
            {
                usuario.Nombres = datos.Nombres.Trim();
            }

            if (!string.IsNullOrWhiteSpace(datos.Apellidos))
            {
                usuario.Apellidos = datos.Apellidos.Trim();
            }

            if (!string.IsNullOrWhiteSpace(datos.Correo))
            {
                usuario.Correo = datos.Correo.Trim();
            }

            // Solo Administrador puede cambiar roles.
            if (rolActual == "Administrador" &&
                !string.IsNullOrWhiteSpace(datos.Rol))
            {
                if (datos.Rol != "Cliente" &&
                    datos.Rol != "Vendedor" &&
                    datos.Rol != "Administrador")
                {
                    return BadRequest(new
                    {
                        mensaje = "El rol indicado no es válido."
                    });
                }

                usuario.Rol = datos.Rol;
            }

            // La contraseña se conserva intacta.
            await _usuarioDAO.ActualizarUsuarioAsync(usuario);

            return Ok(new
            {
                mensaje = "Usuario actualizado correctamente."
            });
        }



        // DELETE: api/Usuario/5
        [Authorize(Roles = "Administrador")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {

            var claim = User.FindFirst(
                ClaimTypes.NameIdentifier
            )?.Value;

            if (!int.TryParse(claim, out int idAdministrador))
            {
                return Unauthorized(new
                {
                    mensaje = "No fue posible identificar al administrador."
                });
            }

            if (idAdministrador == id)
            {
                return BadRequest(new
                {
                    mensaje = "No puedes eliminar tu propia cuenta administrativa."
                });
            }

            var usuario =
                await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);

            if (usuario == null)
            {
                return NotFound(new
                {
                    mensaje = "Usuario no encontrado."
                });
            }

            await _usuarioDAO.EliminarUsuarioAsync(id);

            return Ok(new
            {
                mensaje = "Usuario eliminado exitosamente."
            });
        }




        // POST: api/Usuario/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(
        [FromBody] LoginRequest loginRequest)
        {
            if (string.IsNullOrWhiteSpace(loginRequest.Correo) ||
                string.IsNullOrWhiteSpace(loginRequest.Clave))
            {
                return BadRequest(new
                {
                    mensaje = "Correo y clave son obligatorios."
                });
            }

            var usuario =
                await _usuarioDAO.ObtenerUsuarioPorCorreoAsync(
                    loginRequest.Correo
                );

            if (usuario == null)
            {
                return Unauthorized(new
                {
                    mensaje = "Credenciales incorrectas."
                });
            }

            var passwordCorrecto =
                _authService.VerifyPassword(
                    usuario,
                    loginRequest.Clave
                );

            if (!passwordCorrecto)
            {
                return Unauthorized(new
                {
                    mensaje = "Credenciales incorrectas."
                });
            }

            var token = _authService.GenerateJwt(usuario);

            return Ok(new
            {
                mensaje = "Inicio de sesión exitoso",

                token = token,

                usuario = new
                {
                    idUsuario = usuario.IdUsuario,
                    nombre = $"{usuario.Nombres} {usuario.Apellidos}",
                    correo = usuario.Correo,
                    rol = usuario.Rol
                }
            });
        }



        // POST: api/Usuario/register
        [HttpPost("register")]
        public async Task<ActionResult> RegisterUsuario(
        [FromBody] RegisterRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Nombres) ||
                string.IsNullOrWhiteSpace(request.Apellidos) ||
                string.IsNullOrWhiteSpace(request.Correo) ||
                string.IsNullOrWhiteSpace(request.Clave))
            {
                return BadRequest(new
                {
                    mensaje = "Todos los campos son obligatorios."
                });
            }

            if (request.Rol != "Cliente" &&
                request.Rol != "Vendedor")
            {
                return BadRequest(new
                {
                    mensaje = "Rol no válido. Debe ser Cliente o Vendedor."
                });
            }

            var usuarioExistente =
                await _usuarioDAO.ObtenerUsuarioPorCorreoAsync(
                    request.Correo
                );

            if (usuarioExistente != null)
            {
                return BadRequest(new
                {
                    mensaje = "El correo ya está en uso."
                });
            }

            var usuario = new Usuario
            {
                Nombres = request.Nombres,
                Apellidos = request.Apellidos,
                Correo = request.Correo,
                Rol = request.Rol,
                FechaRegistro =
                    DateOnly.FromDateTime(DateTime.UtcNow)
            };

            usuario.Clave =
                _authService.HashPassword(
                    usuario,
                    request.Clave
                );

            await _usuarioDAO.AgregarUsuarioAsync(usuario);

            return CreatedAtAction(
                nameof(GetUsuario),
                new { id = usuario.IdUsuario },
                new
                {
                    usuario.IdUsuario,
                    usuario.Nombres,
                    usuario.Apellidos,
                    usuario.Correo,
                    usuario.Rol,
                    usuario.FechaRegistro
                }
            );
        }



    }
}