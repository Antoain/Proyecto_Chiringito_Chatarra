using ChiringuitoCH_Data.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ChiringuitoCH_Data.DTOs;
using ChiringuitoCH_Data.Models;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InventarioController : ControllerBase
    {
        private readonly InventarioDAO _inventarioDAO;

        public InventarioController(
            InventarioDAO inventarioDAO)
        {
            _inventarioDAO = inventarioDAO;
        }


        // ==========================================
        // MI INVENTARIO - VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpGet("MiInventario")]
        public async Task<IActionResult> MiInventario()
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

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


            var inventario =
                await _inventarioDAO
                    .ObtenerInventarioPorVendedorAsync(
                        idVendedor
                    );


            if (inventario == null ||
                !inventario.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró inventario para sus productos."
                });
            }


            var resultado =
                inventario.Select(i => new
                {
                    i.IdInventario,

                    i.IdProducto,

                    Producto =
                        i.IdProductoNavigation?.Nombre,

                    IdTienda =
                        i.IdProductoNavigation?.IdTienda,

                    Tienda =
                        i.IdProductoNavigation?
                            .IdTiendaNavigation?
                            .NombreNegocio,

                    i.StockActual,

                    i.StockMinimo,

                    i.StockMaximo,

                    EstadoStock =
                        i.StockActual == 0
                            ? "AGOTADO"
                            : i.StockActual <= i.StockMinimo
                                ? "STOCK BAJO"
                                : "DISPONIBLE",

                    i.FechaActualizacion
                })
                .ToList();


            return Ok(resultado);
        }

        // ==========================================
        // REGISTRAR ENTRADA DE INVENTARIO
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost("Entrada")]
        public async Task<IActionResult> RegistrarEntrada(
            [FromBody] EntradaInventarioRequest request)
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

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


            // ==========================================
            // 2. VALIDAR DATOS
            // ==========================================

            if (request == null ||
                request.IdProducto <= 0 ||
                request.Cantidad <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto y la cantidad son obligatorios. " +
                        "La cantidad debe ser mayor que cero."
                });
            }


            // ==========================================
            // 3. OBTENER INVENTARIO
            // ==========================================

            var inventario =
                await _inventarioDAO
                    .ObtenerInventarioCompletoPorProductoAsync(
                        request.IdProducto
                    );

            if (inventario == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró inventario para este producto."
                });
            }


            // ==========================================
            // 4. VALIDAR PROPIEDAD DEL PRODUCTO
            // ==========================================

            var producto =
                inventario.IdProductoNavigation;

            if (producto == null ||
                producto.IdTiendaNavigation == null ||
                producto.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar " +
                        "el inventario de este producto."
                });
            }


            // ==========================================
            // 5. CALCULAR NUEVO STOCK
            // ==========================================

            int stockAnterior =
                inventario.StockActual;

            int stockNuevo =
                stockAnterior +
                request.Cantidad;


            // ==========================================
            // 6. ACTUALIZAR INVENTARIO
            // ==========================================

            inventario.StockActual =
                stockNuevo;

            inventario.FechaActualizacion =
                DateTime.Now;

            await _inventarioDAO
                .ActualizarInventarioAsync(
                    inventario
                );


            // ==========================================
            // 7. MANTENER PRODUCTO.STOCK SINCRONIZADO
            // ==========================================

            producto.Stock =
                stockNuevo;


            // ==========================================
            // 8. REGISTRAR MOVIMIENTO
            // ==========================================

            var movimiento =
                new MovimientoInventario
                {
                    IdInventario =
                        inventario.IdInventario,

                    TipoMovimiento =
                        "ENTRADA",

                    Cantidad =
                        request.Cantidad,

                    StockAnterior =
                        stockAnterior,

                    StockNuevo =
                        stockNuevo,

                    Motivo =
                        string.IsNullOrWhiteSpace(request.Motivo)
                            ? "Entrada de inventario"
                            : request.Motivo.Trim(),

                    Referencia =
                        null,

                    FechaMovimiento =
                        DateTime.Now
                };


            await _inventarioDAO
                .RegistrarMovimientoAsync(
                    movimiento
                );


            // ==========================================
            // 9. ACTUALIZAR PRODUCTO.STOCK
            // ==========================================

            await _inventarioDAO
                .ActualizarProductoAsync(
                    producto
                );


            // ==========================================
            // 10. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Entrada de inventario registrada correctamente.",

                idProducto =
                    producto.IdProducto,

                producto =
                    producto.Nombre,

                cantidadEntrada =
                    request.Cantidad,

                stockAnterior =
                    stockAnterior,

                stockActual =
                    stockNuevo,

                motivo =
                    movimiento.Motivo
            });
        }

        // ==========================================
        // DEVOLUCIÓN DE PRODUCTO
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost("Devolucion")]
        public async Task<IActionResult> Devolucion(
            [FromBody] DevolucionInventarioRequest request,
            [FromServices] PedidoDAO pedidoDAO)
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }


            // ==========================================
            // 2. VALIDAR DATOS
            // ==========================================

            if (request == null ||
                request.IdSubPedido <= 0 ||
                request.IdProducto <= 0 ||
                request.Cantidad <= 0)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos de la devolución no son válidos."
                });
            }


            // ==========================================
            // 3. BUSCAR SUBPEDIDO
            // ==========================================

            var subPedido =
                await pedidoDAO.ObtenerSubPedidoPorIdAsync(
                    request.IdSubPedido
                );

            if (subPedido == null)
            {
                return NotFound(new
                {
                    mensaje = "El subpedido no existe."
                });
            }


            // ==========================================
            // 4. VALIDAR PROPIEDAD DE LA TIENDA
            // ==========================================

            if (subPedido.IdTiendaNavigation == null ||
                subPedido.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para registrar devoluciones de este pedido."
                });
            }


            // ==========================================
            // 5. VALIDAR PRODUCTO DEL SUBPEDIDO
            // ==========================================

            var detalle =
                await pedidoDAO.ObtenerDetalleSubPedidoAsync(
                    request.IdSubPedido,
                    request.IdProducto
                );

            if (detalle == null)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto no pertenece a este subpedido."
                });
            }


            // ==========================================
            // 6. VALIDAR CANTIDAD DISPONIBLE PARA DEVOLVER
            // ==========================================

            int cantidadDevuelta =
                await pedidoDAO.ObtenerCantidadDevueltaAsync(
                    request.IdSubPedido,
                    request.IdProducto
                );

            int cantidadDisponible =
                detalle.Cantidad - cantidadDevuelta;

            if (cantidadDisponible <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Todas las unidades de este producto ya fueron devueltas."
                });
            }

            if (request.Cantidad > cantidadDisponible)
            {
                return BadRequest(new
                {
                    mensaje =
                        $"No puede devolver {request.Cantidad} unidades. " +
                        $"Cantidad comprada: {detalle.Cantidad}. " +
                        $"Ya devueltas: {cantidadDevuelta}. " +
                        $"Disponibles para devolver: {cantidadDisponible}."
                });
            }


            // ==========================================
            // 7. OBTENER INVENTARIO
            // ==========================================

            var inventario =
                await _inventarioDAO
                    .ObtenerInventarioCompletoPorProductoAsync(
                        request.IdProducto
                    );

            if (inventario == null ||
                inventario.IdProductoNavigation == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el inventario del producto."
                });
            }


            // ==========================================
            // 8. CALCULAR NUEVO STOCK
            // ==========================================

            int stockAnterior =
                inventario.StockActual;

            int stockNuevo =
                stockAnterior + request.Cantidad;


            // ==========================================
            // 9. ACTUALIZAR INVENTARIO
            // ==========================================

            inventario.StockActual =
                stockNuevo;

            inventario.FechaActualizacion =
                DateTime.Now;

            await _inventarioDAO
                .ActualizarInventarioAsync(
                    inventario
                );


            // ==========================================
            // 10. SINCRONIZAR PRODUCTO.STOCK
            // ==========================================

            var producto =
                inventario.IdProductoNavigation;

            producto.Stock =
                stockNuevo;

            await _inventarioDAO
                .ActualizarProductoAsync(
                    producto
                );


            // ==========================================
            // 11. REGISTRAR MOVIMIENTO
            // ==========================================

            var movimiento =
                new MovimientoInventario
                {
                    IdInventario =
                        inventario.IdInventario,

                    TipoMovimiento =
                        "DEVOLUCION",

                    Cantidad =
                        request.Cantidad,

                    StockAnterior =
                        stockAnterior,

                    StockNuevo =
                        stockNuevo,

                    Motivo =
                        string.IsNullOrWhiteSpace(request.Motivo)
                            ? "Devolución de producto"
                            : request.Motivo.Trim(),

                    Referencia =
                        $"SUBPEDIDO #{request.IdSubPedido}",

                    FechaMovimiento =
                        DateTime.Now
                };


            await _inventarioDAO
                .RegistrarMovimientoAsync(
                    movimiento
                );


            // ==========================================
            // 12. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Devolución registrada correctamente.",

                idProducto =
                    request.IdProducto,

                cantidadDevuelta =
                    request.Cantidad,

                stockAnterior,

                stockNuevo,

                referencia =
                    $"SUBPEDIDO #{request.IdSubPedido}"
            });
        }


        // ==========================================
        // AJUSTE DE INVENTARIO
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost("Ajuste")]
        public async Task<IActionResult> Ajuste(
            [FromBody] AjusteInventarioRequest request)
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al vendedor."
                });
            }


            // ==========================================
            // 2. VALIDAR DATOS
            // ==========================================

            if (request == null ||
                request.IdProducto <= 0 ||
                request.StockFisico < 0)
            {
                return BadRequest(new
                {
                    mensaje = "Los datos del ajuste no son válidos."
                });
            }


            // ==========================================
            // 3. OBTENER INVENTARIO
            // ==========================================

            var inventario =
                await _inventarioDAO
                    .ObtenerInventarioCompletoPorProductoAsync(
                        request.IdProducto
                    );

            if (inventario == null ||
                inventario.IdProductoNavigation == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el inventario del producto."
                });
            }


            // ==========================================
            // 4. VALIDAR PROPIEDAD DEL PRODUCTO
            // ==========================================

            var producto =
                inventario.IdProductoNavigation;

            if (producto.IdTiendaNavigation == null ||
                producto.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para ajustar el inventario de este producto."
                });
            }


            // ==========================================
            // 5. OBTENER STOCK ACTUAL
            // ==========================================

            int stockAnterior =
                inventario.StockActual;

            int stockNuevo =
                request.StockFisico;


            // ==========================================
            // 6. VALIDAR SI HAY CAMBIO
            // ==========================================

            if (stockAnterior == stockNuevo)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El stock físico es igual al stock registrado. No se requiere ajuste."
                });
            }


            // ==========================================
            // 7. DETERMINAR TIPO DE AJUSTE
            // ==========================================

            string tipoMovimiento;

            int cantidadAjuste;

            if (stockNuevo > stockAnterior)
            {
                tipoMovimiento =
                    "AJUSTE_ENTRADA";

                cantidadAjuste =
                    stockNuevo - stockAnterior;
            }
            else
            {
                tipoMovimiento =
                    "AJUSTE_SALIDA";

                cantidadAjuste =
                    stockAnterior - stockNuevo;
            }


            // ==========================================
            // 8. ACTUALIZAR INVENTARIO
            // ==========================================

            inventario.StockActual =
                stockNuevo;

            inventario.FechaActualizacion =
                DateTime.Now;

            await _inventarioDAO
                .ActualizarInventarioAsync(
                    inventario
                );


            // ==========================================
            // 9. SINCRONIZAR PRODUCTO.STOCK
            // ==========================================

            producto.Stock =
                stockNuevo;

            await _inventarioDAO
                .ActualizarProductoAsync(
                    producto
                );


            // ==========================================
            // 10. REGISTRAR MOVIMIENTO
            // ==========================================

            var movimiento =
                new MovimientoInventario
                {
                    IdInventario =
                        inventario.IdInventario,

                    TipoMovimiento =
                        tipoMovimiento,

                    Cantidad =
                        cantidadAjuste,

                    StockAnterior =
                        stockAnterior,

                    StockNuevo =
                        stockNuevo,

                    Motivo =
                        string.IsNullOrWhiteSpace(request.Motivo)
                            ? "Ajuste manual de inventario"
                            : request.Motivo.Trim(),

                    Referencia =
                        $"PRODUCTO #{request.IdProducto}",

                    FechaMovimiento =
                        DateTime.Now
                };


            await _inventarioDAO
                .RegistrarMovimientoAsync(
                    movimiento
                );


            // ==========================================
            // 11. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Inventario ajustado correctamente.",

                idProducto =
                    request.IdProducto,

                tipoMovimiento,

                cantidadAjustada =
                    cantidadAjuste,

                stockAnterior,

                stockNuevo
            });
        }

        // ==========================================
        // ALERTAS DE STOCK BAJO
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpGet("StockBajo")]
        public async Task<IActionResult> StockBajo()
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

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


            // ==========================================
            // 2. OBTENER PRODUCTOS CON STOCK BAJO
            // ==========================================

            var inventarios =
                await _inventarioDAO
                    .ObtenerStockBajoPorVendedorAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. PREPARAR RESULTADO
            // ==========================================

            var resultado =
                inventarios.Select(i => new
                {
                    i.IdInventario,

                    i.IdProducto,

                    Producto =
                        i.IdProductoNavigation != null
                            ? i.IdProductoNavigation.Nombre
                            : "Producto no disponible",

                    IdTienda =
                        i.IdProductoNavigation != null
                            ? i.IdProductoNavigation.IdTienda
                            : 0,

                    Tienda =
                        i.IdProductoNavigation?
                            .IdTiendaNavigation != null
                                ? i.IdProductoNavigation
                                    .IdTiendaNavigation
                                    .NombreNegocio
                                : "Tienda no disponible",

                    i.StockActual,

                    i.StockMinimo,

                    Faltante =
                        i.StockActual < i.StockMinimo
                            ? i.StockMinimo - i.StockActual
                            : 0,

                    Estado =
                        i.StockActual == 0
                            ? "AGOTADO"
                            : "STOCK_BAJO"
                })
                .ToList();


            // ==========================================
            // 4. RESPUESTA
            // ==========================================

            return Ok(new
            {
                cantidadAlertas =
                    resultado.Count,

                productos =
                    resultado
            });
        }

        // ==========================================
        // HISTORIAL DE MOVIMIENTOS DEL VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpGet("Movimientos")]
        public async Task<IActionResult> ObtenerMovimientos()
        {
            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes.NameIdentifier
                )?.Value;

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

            var movimientos =
                await _inventarioDAO
                    .ObtenerMovimientosPorVendedorAsync(
                        idVendedor
                    );

            if (movimientos == null ||
                !movimientos.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontraron movimientos de inventario."
                });
            }

            var resultado =
                movimientos.Select(m => new
                {
                    m.IdMovimiento,

                    m.IdInventario,

                    IdProducto =
                        m.IdInventarioNavigation?
                            .IdProducto,

                    Producto =
                        m.IdInventarioNavigation?
                            .IdProductoNavigation?
                            .Nombre,

                    Tienda =
                        m.IdInventarioNavigation?
                            .IdProductoNavigation?
                            .IdTiendaNavigation?
                            .NombreNegocio,

                    m.TipoMovimiento,

                    m.Cantidad,

                    m.StockAnterior,

                    m.StockNuevo,

                    m.Motivo,

                    m.Referencia,

                    m.FechaMovimiento
                })
                .ToList();

            return Ok(resultado);
        }


    }
}