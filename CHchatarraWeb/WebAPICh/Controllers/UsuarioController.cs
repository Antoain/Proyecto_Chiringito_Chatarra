using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.DTOs;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : Controller
    {
        private readonly UsuarioDAO _usuarioDAO;
        private readonly VendedorDAO _vendedorDAO;

        public UsuarioController(UsuarioDAO usuarioDAO, VendedorDAO vendedorDAO)
        {
            _usuarioDAO = usuarioDAO;
            _vendedorDAO = vendedorDAO; // ✅ Inyecta VendedorDAO correctamente
        }

        // GET: api/Usuarios
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
                Clave = u.Clave,
                Rol = u.Rol,
                FechaRegistro = u.FechaRegistro // Confirmamos que la fecha esté incluida
            }).ToList();

            return Ok(usuariosFiltrados);
        }


        // GET: api/Usuarios/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Usuario>> GetUsuario(int id)
        {
            var usuario = await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);
            if (usuario == null)
            {
                return NotFound();
            }
            return Ok(usuario);
        }

        // POST: api/Usuarios
        [HttpPost("PostUsuario")]
        public async Task<ActionResult<Usuario>> PostUsuario(Usuario usuario)
        {
            await _usuarioDAO.AgregarUsuarioAsync(usuario);
            return CreatedAtAction(nameof(GetUsuario), new { id = usuario.IdUsuario }, usuario);
        }

        // PUT: api/Usuarios/5
        [HttpPut("Editar")]
        public async Task<IActionResult> PutUsuario(int id, [FromBody] Usuario usuario)
        {
            // Validar que el ID en la URL y en el cuerpo coincidan
            if (id != usuario.IdUsuario)
            {
                return BadRequest(new { mensaje = "El ID en la URL no coincide con el ID del usuario enviado." });
            }

            // Buscar el usuario existente en la base de datos
            var usuarioExistente = await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);
            if (usuarioExistente == null)
            {
                return NotFound(new { mensaje = "El usuario especificado no existe." });
            }

            // Actualizar solo los campos proporcionados
            usuarioExistente.Nombres = !string.IsNullOrEmpty(usuario.Nombres) ? usuario.Nombres : usuarioExistente.Nombres;
            usuarioExistente.Apellidos = !string.IsNullOrEmpty(usuario.Apellidos) ? usuario.Apellidos : usuarioExistente.Apellidos;
            usuarioExistente.Correo = !string.IsNullOrEmpty(usuario.Correo) ? usuario.Correo : usuarioExistente.Correo;
            usuarioExistente.Rol = !string.IsNullOrEmpty(usuario.Rol) ? usuario.Rol : usuarioExistente.Rol;
            usuarioExistente.Clave = !string.IsNullOrEmpty(usuario.Clave) ? usuario.Clave : usuarioExistente.Clave;

            // Guardar los cambios en la base de datos
            await _usuarioDAO.ActualizarUsuarioAsync(usuarioExistente);

            return Ok(new { mensaje = "Usuario actualizado correctamente." });
        }






        // DELETE: api/Usuarios/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUsuario(int id)
        {
            var usuario = await _usuarioDAO.ObtenerUsuarioPorIdAsync(id);
            if (usuario == null)
            {
                return NotFound(new { mensaje = "Usuario no encontrado." });
            }

            await _usuarioDAO.EliminarUsuarioAsync(id);
            return Ok(new { mensaje = "Usuario eliminado exitosamente." }); ;
        }


        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest loginRequest)
        {
            if (string.IsNullOrWhiteSpace(loginRequest.Correo) || string.IsNullOrWhiteSpace(loginRequest.Clave))
            {
                return BadRequest(new { mensaje = "Correo y clave son obligatorios." });
            }

            // Verificar credenciales
            var usuario = _usuarioDAO.VerificarCredenciales(loginRequest.Correo, loginRequest.Clave);
            if (usuario == null)
            {
                return Unauthorized(new { mensaje = "Credenciales incorrectas." });
            }

            // Devolver información del rol
            return Ok(new
            {
                mensaje = "Inicio de sesión exitoso",
                usuario = new
                {
                    idUsuario = usuario.IdUsuario,
                    nombre = $"{usuario.Nombres} {usuario.Apellidos}",
                    correo = usuario.Correo,
                    rol = usuario.Rol // Incluimos el rol
                }
            });
        }


        [HttpPost("register")]
        public async Task<ActionResult<Usuario>> RegisterUsuario([FromBody] Usuario usuario)
        {
            if (usuario == null ||
                string.IsNullOrWhiteSpace(usuario.Nombres) ||
                string.IsNullOrWhiteSpace(usuario.Apellidos) ||
                string.IsNullOrWhiteSpace(usuario.Correo) ||
                string.IsNullOrWhiteSpace(usuario.Clave))
            {
                return BadRequest(new { mensaje = "Todos los campos son obligatorios." });
            }

            if (usuario.Rol != "Cliente" && usuario.Rol != "Vendedor")
            {
                return BadRequest(new { mensaje = "Rol no válido. Debe ser Cliente o Vendedor." });
            }

            var usuarioExistente = await _usuarioDAO.ObtenerUsuarioPorCorreoAsync(usuario.Correo);
            if (usuarioExistente != null)
            {
                return BadRequest(new { mensaje = "El correo ya está en uso." });
            }

            usuario.FechaRegistro = DateOnly.FromDateTime(DateTime.UtcNow);
            await _usuarioDAO.AgregarUsuarioAsync(usuario);

            var usuarioCreado = await _usuarioDAO.ObtenerUsuarioPorCorreoAsync(usuario.Correo);
            if (usuarioCreado == null)
            {
                return StatusCode(500, new { mensaje = "Error al registrar el usuario." });
            }

            // 🔹 **Evitar duplicados: Verificar si el usuario ya existe en `Vendedores`**
            var vendedorExistente = await _vendedorDAO.ObtenerVendedorPorIdAsync(usuarioCreado.IdUsuario);
            if (vendedorExistente == null) // ✅ Solo insertar si no existe
            {
                var nuevoVendedor = new Vendedore
                {
                    IdUsuario = usuarioCreado.IdUsuario,
                    FechaInicio = DateOnly.FromDateTime(DateTime.UtcNow),
                    Rfc = null
                };

                await _vendedorDAO.CrearVendedorAsync(nuevoVendedor);
            }

            return CreatedAtAction(nameof(GetUsuario), new { id = usuarioCreado.IdUsuario }, new
            {
                usuarioCreado.IdUsuario,
                usuarioCreado.Nombres,
                usuarioCreado.Apellidos,
                usuarioCreado.Correo,
                usuarioCreado.Rol,
                usuarioCreado.FechaRegistro
            });
        }






    }
}
