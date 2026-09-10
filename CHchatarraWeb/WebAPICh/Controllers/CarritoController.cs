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
    public class CarritoController : ControllerBase
    {
        private readonly CarritoDAO _carritoDao;
        private readonly ProductosDAO _productoDAO;

        public CarritoController(
            CarritoDAO carritoDao,
            ProductosDAO productoDAO)
        {
            _carritoDao = carritoDao;
            _productoDAO = productoDAO;
        }


        // ==========================================
        // OBTENER MI CARRITO
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpGet("ObtenerCarrito")]
        public async Task<IActionResult> ObtenerCarrito()
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


            var carrito =
                await _carritoDao
                    .ObtenerCarritoPorUsuario(
                        idUsuario
                    );


            if (carrito == null ||
                !carrito.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "El carrito está vacío."
                });
            }


            return Ok(carrito);
        }


        // ==========================================
        // AGREGAR PRODUCTO AL CARRITO
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarAlCarrito(
            [FromBody] AgregarCarritoRequest request)
        {
            if (request == null ||
                request.IdProducto <= 0 ||
                request.Cantidad <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "Datos inválidos."
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


            // Comprobar que el producto exista
            var producto =
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        request.IdProducto
                    );


            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El producto no existe."
                });
            }


            // Comprobar que esté activo
            if (producto.Activo != true)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto no está disponible."
                });
            }


            // Comprobar stock
            if (producto.Stock <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto está agotado."
                });
            }


            if (request.Cantidad > producto.Stock)
            {
                return BadRequest(new
                {
                    mensaje =
                        "No hay suficiente stock disponible."
                });
            }


            var carrito = new Carrito
            {
                IdUsuario = idUsuario,
                IdProducto = request.IdProducto,
                Cantidad = request.Cantidad
            };


            var resultado =
                await _carritoDao
                    .AgregarAlCarrito(
                        carrito
                    );


            if (!resultado)
            {
                return BadRequest(new
                {
                    mensaje =
                        "No se pudo agregar el producto al carrito."
                });
            }


            return Ok(new
            {
                mensaje =
                    "Producto agregado al carrito."
            });
        }


        // ==========================================
        // REQUEST CANTIDAD
        // ==========================================

        public class CantidadRequest
        {
            public int Cantidad { get; set; }
        }


        // ==========================================
        // ACTUALIZAR CANTIDAD
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpPut("ActualizarCantidad/{idCarrito}")]
        public async Task<IActionResult> ActualizarCantidad(
            int idCarrito,
            [FromBody] CantidadRequest request)
        {
            if (request == null ||
                request.Cantidad < 1)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Formato de cantidad incorrecto."
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


            // Buscar el registro del carrito
            var carrito =
                await _carritoDao
                    .ObtenerCarritoPorIdAsync(
                        idCarrito
                    );


            if (carrito == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el producto en el carrito."
                });
            }


            // IMPORTANTE:
            // verificar que el carrito pertenezca
            // al usuario autenticado
            if (carrito.IdUsuario != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar este carrito."
                });
            }


            // Comprobar que el producto todavía exista
            if (carrito.IdProducto == null)
            {
                return BadRequest(new
                {
                    mensaje = "El carrito no tiene un producto válido asociado."
                });
            }

            // Comprobar que el producto todavía exista
            var producto =
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        carrito.IdProducto.Value
                    );

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto ya no existe."
                });
            }


            // Producto inactivo
            if (producto.Activo != true)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto ya no está disponible."
                });
            }


            // Comprobar stock
            if (request.Cantidad > producto.Stock)
            {
                return BadRequest(new
                {
                    mensaje =
                        "No hay suficiente stock disponible."
                });
            }


            var resultado =
                await _carritoDao
                    .ActualizarCantidadCarrito(
                        idCarrito,
                        request.Cantidad
                    );


            if (!resultado)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el producto en el carrito."
                });
            }


            return Ok(new
            {
                mensaje =
                    "Cantidad actualizada correctamente."
            });
        }


        // ==========================================
        // ELIMINAR PRODUCTO DEL CARRITO
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpDelete("Eliminar/{idCarrito}")]
        public async Task<IActionResult> EliminarDelCarrito(
            int idCarrito)
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


            // Buscar carrito
            var carrito =
                await _carritoDao
                    .ObtenerCarritoPorIdAsync(
                        idCarrito
                    );


            if (carrito == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No existe ese producto en el carrito."
                });
            }


            // Verificar propietario
            if (carrito.IdUsuario != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar este producto del carrito."
                });
            }


            var resultado =
                await _carritoDao
                    .EliminarDelCarrito(
                        idCarrito
                    );


            if (!resultado)
            {
                return NotFound(new
                {
                    mensaje =
                        "No existe ese producto en el carrito."
                });
            }


            return Ok(new
            {
                mensaje =
                    "Producto eliminado del carrito."
            });
        }
    }
}