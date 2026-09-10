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
    public class ProductoController : ControllerBase
    {
        private readonly ProductosDAO _productoDAO;
        private readonly TiendaDAO _tiendaDAO;
        private readonly CategoriaDAO _categoriaDAO;

        public ProductoController(
            ProductosDAO productoDAO,
            TiendaDAO tiendaDAO,
            CategoriaDAO categoriaDAO)
        {
            _productoDAO = productoDAO;
            _tiendaDAO = tiendaDAO;
            _categoriaDAO = categoriaDAO;
        }


        // ==========================================
        // OBTENER TODOS LOS PRODUCTOS - PÚBLICO
        // ==========================================

        [HttpGet("ObtenerProductos")]
        public async Task<ActionResult<IEnumerable<Producto>>> GetProductos()
        {
            var productos =
                await _productoDAO.ObtenerProductosAsync();

            return Ok(productos);
        }


        // ==========================================
        // OBTENER PRODUCTO POR ID - PÚBLICO
        // ==========================================

        [HttpGet("ObtenerProducto/{id}")]
        public async Task<ActionResult<Producto>> GetProducto(int id)
        {
            var producto =
                await _productoDAO.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }

            return Ok(producto);
        }


        // ==========================================
        // CREAR PRODUCTO - SOLO VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost("CrearProductos")]
        public async Task<IActionResult> PostProducto(
            [FromBody] CrearProductoRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Nombre))
            {
                return BadRequest(new
                {
                    mensaje = "El nombre del producto es obligatorio."
                });
            }

            if (request.Precio < 0)
            {
                return BadRequest(new
                {
                    mensaje = "El precio no puede ser negativo."
                });
            }

            if (request.Stock < 0)
            {
                return BadRequest(new
                {
                    mensaje = "El stock no puede ser negativo."
                });
            }


            // Obtener vendedor autenticado desde JWT
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }


            // Comprobar que la tienda exista
            var tienda =
                await _tiendaDAO.ObtenerTiendaPorIdAsync(
                    request.IdTienda
                );

            if (tienda == null)
            {
                return BadRequest(new
                {
                    mensaje = "La tienda seleccionada no existe."
                });
            }


            // IMPORTANTE:
            // el vendedor solo puede crear productos
            // dentro de SUS tiendas.
            if (tienda.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para agregar productos a esta tienda."
                });
            }


            // Comprobar categoría
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


            var producto = new Producto
            {
                Nombre = request.Nombre,
                Descripcion = request.Descripcion,
                IdTienda = request.IdTienda,
                IdCategoria = request.IdCategoria,
                Precio = request.Precio,
                Stock = request.Stock,
                Sku = request.Sku,
                RutaImagen = request.RutaImagen,
                Activo = request.Activo,

                FechaRegistro =
                    DateOnly.FromDateTime(DateTime.UtcNow)
            };


            await _productoDAO.CrearProductoAsync(producto);


            return CreatedAtAction(
                nameof(GetProducto),
                new { id = producto.IdProducto },
                new
                {
                    producto.IdProducto,
                    producto.Nombre,
                    producto.Descripcion,
                    producto.IdTienda,
                    producto.IdCategoria,
                    producto.Precio,
                    producto.Stock,
                    producto.Sku,
                    producto.RutaImagen,
                    producto.Activo,
                    producto.FechaRegistro
                }
            );
        }


        // ==========================================
        // EDITAR PRODUCTO
        // VENDEDOR PROPIETARIO O ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpPut("EditarProductos/{id}")]
        public async Task<IActionResult> PutProducto(
            int id,
            [FromBody] EditarProductoRequest request)
        {
            // ==========================================
            // 1. BUSCAR PRODUCTO
            // ==========================================

            var producto =
                await _productoDAO.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
                });
            }


            // ==========================================
            // 2. IDENTIFICAR USUARIO AUTENTICADO
            // ==========================================

            var rol =
                User.FindFirst(ClaimTypes.Role)?.Value;

            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier)?.Value;

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


            // ==========================================
            // 3. VALIDAR PROPIEDAD DEL PRODUCTO
            // SI ES VENDEDOR
            // ==========================================

            if (rol == "Vendedor")
            {
                var vendedorProducto =
                    await _productoDAO
                        .ObtenerVendedorPorProductoAsync(id);

                if (vendedorProducto == null ||
                    vendedorProducto.IdUsuario != idUsuario)
                {
                    return StatusCode(403, new
                    {
                        mensaje =
                            "No tiene permiso para editar este producto."
                    });
                }
            }


            // ==========================================
            // 4. VALIDAR CATEGORÍA
            // ==========================================

            var categoria =
                await _categoriaDAO
                    .ObtenerCategoriaPorIdAsync(
                        request.IdCategoria
                    );

            if (categoria == null)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La categoría seleccionada no existe."
                });
            }


            // ==========================================
            // 5. VALIDAR PRECIO
            // ==========================================

            if (request.Precio < 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El precio no puede ser negativo."
                });
            }


            // ==========================================
            // 6. VALIDAR STOCK
            // ==========================================

            if (request.Stock < 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El stock no puede ser negativo."
                });
            }


            // ==========================================
            // 7. OBTENER INVENTARIO
            // ==========================================

            var inventario =
                await _productoDAO
                    .ObtenerInventarioPorProductoAsync(
                        producto.IdProducto
                    );

            if (inventario == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el inventario asociado al producto."
                });
            }


            // ==========================================
            // 8. GUARDAR STOCK ANTERIOR
            // ==========================================

            int stockAnterior =
                inventario.StockActual;

            int stockNuevo =
                request.Stock;


            // ==========================================
            // 9. ACTUALIZAR DATOS DEL PRODUCTO
            // ==========================================

            producto.Nombre =
                !string.IsNullOrWhiteSpace(request.Nombre)
                    ? request.Nombre
                    : producto.Nombre;

            producto.Descripcion =
                !string.IsNullOrWhiteSpace(
                    request.Descripcion)
                    ? request.Descripcion
                    : producto.Descripcion;

            producto.IdCategoria =
                request.IdCategoria;

            producto.Precio =
                request.Precio;

            producto.Sku =
                !string.IsNullOrWhiteSpace(request.Sku)
                    ? request.Sku
                    : producto.Sku;

            producto.RutaImagen =
                !string.IsNullOrWhiteSpace(
                    request.RutaImagen)
                    ? request.RutaImagen
                    : producto.RutaImagen;

            producto.Activo =
                request.Activo;


            // ==========================================
            // 10. SINCRONIZAR STOCK
            // ==========================================

            producto.Stock =
                stockNuevo;

            inventario.StockActual =
                stockNuevo;

            inventario.FechaActualizacion =
                DateTime.Now;


            // ==========================================
            // 11. CREAR MOVIMIENTO SI CAMBIÓ STOCK
            // ==========================================

            MovimientoInventario? movimiento =
                null;

            if (stockAnterior != stockNuevo)
            {
                string tipoMovimiento;

                int cantidadMovimiento;


                if (stockNuevo > stockAnterior)
                {
                    tipoMovimiento =
                        "AJUSTE_ENTRADA";

                    cantidadMovimiento =
                        stockNuevo - stockAnterior;
                }
                else
                {
                    tipoMovimiento =
                        "AJUSTE_SALIDA";

                    cantidadMovimiento =
                        stockAnterior - stockNuevo;
                }


                movimiento =
                    new MovimientoInventario
                    {
                        IdInventario =
                            inventario.IdInventario,

                        TipoMovimiento =
                            tipoMovimiento,

                        Cantidad =
                            cantidadMovimiento,

                        StockAnterior =
                            stockAnterior,

                        StockNuevo =
                            stockNuevo,

                        Motivo =
                            "Ajuste realizado desde edición de producto",

                        Referencia =
                            $"PRODUCTO #{producto.IdProducto}",

                        FechaMovimiento =
                            DateTime.Now
                    };
            }


            // ==========================================
            // 12. GUARDAR TODO EN TRANSACCIÓN
            // ==========================================

            await _productoDAO
                .ActualizarProductoConInventarioAsync(
                    producto,
                    inventario,
                    movimiento
                );


            // ==========================================
            // 13. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Producto actualizado correctamente.",

                producto = new
                {
                    producto.IdProducto,
                    producto.Nombre,
                    producto.Descripcion,
                    producto.IdCategoria,
                    producto.Precio,
                    producto.Stock,
                    producto.Sku,
                    producto.RutaImagen,
                    producto.Activo
                },

                inventario = new
                {
                    inventario.IdInventario,
                    inventario.StockActual,
                    inventario.StockMinimo,
                    inventario.StockMaximo
                },

                movimiento =
                    movimiento == null
                        ? null
                        : new
                        {
                            movimiento.TipoMovimiento,
                            movimiento.Cantidad,
                            movimiento.StockAnterior,
                            movimiento.StockNuevo
                        }
            });
        }

        // ==========================================
        // ELIMINAR PRODUCTO
        // VENDEDOR PROPIETARIO O ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpDelete("EliminarProducto/{id}")]
        public async Task<IActionResult> DeleteProducto(int id)
        {
            var producto =
                await _productoDAO.ObtenerProductoPorIdAsync(id);

            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje = "El producto no existe."
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


            if (rol == "Vendedor")
            {
                var vendedorProducto =
                    await _productoDAO
                        .ObtenerVendedorPorProductoAsync(id);

                if (vendedorProducto == null ||
                    vendedorProducto.IdUsuario != idUsuario)
                {
                    return StatusCode(403, new
                    {
                        mensaje =
                            "No tiene permiso para eliminar este producto."
                    });
                }
            }


            await _productoDAO.EliminarProductoAsync(id);

            return NoContent();
        }


        // ==========================================
        // OBTENER PRODUCTOS POR VENDEDOR
        // VENDEDOR PROPIO O ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Vendedor,Administrador")]
        [HttpGet("ObtenerProductosPorVendedor/{idVendedor}")]
        public async Task<ActionResult<IEnumerable<Producto>>>
            ObtenerProductosPorVendedor(int idVendedor)
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


            // Vendedor solo puede consultar sus productos
            if (rol == "Vendedor" &&
                idVendedor != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para consultar estos productos."
                });
            }


            var productos =
                await _productoDAO
                    .ObtenerProductosPorVendedorAsync(idVendedor);


            if (productos == null || !productos.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontraron productos para este vendedor."
                });
            }


            return Ok(productos);
        }
    }
}