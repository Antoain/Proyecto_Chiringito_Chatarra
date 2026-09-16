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
    public class PedidoController : ControllerBase
    {
        private readonly PedidoDAO _pedidoDAO;
        private readonly CoberturaTiendaDAO _coberturaDAO;
        private readonly MetodoEntregaTiendaDAO _metodoEntregaDAO;

        public PedidoController(
            PedidoDAO pedidoDAO,
            CoberturaTiendaDAO coberturaDAO,
            MetodoEntregaTiendaDAO metodoEntregaDAO)
        {
            _pedidoDAO = pedidoDAO;
            _coberturaDAO = coberturaDAO;
            _metodoEntregaDAO = metodoEntregaDAO;
        }


        // ==========================================
        // CHECKOUT
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpPost("Checkout")]
        public async Task<IActionResult> Checkout(
            [FromBody] CheckoutRequest request)
        {
            // ==========================================
            // 1. OBTENER CLIENTE DESDE JWT
            // ==========================================

            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }


            // ==========================================
            // 2. VALIDAR DATOS DEL CHECKOUT
            // ==========================================

            if (request == null ||
                request.IdDistrito <= 0 ||
                string.IsNullOrWhiteSpace(request.DireccionEntrega) ||
                string.IsNullOrWhiteSpace(request.Telefono) ||
                string.IsNullOrWhiteSpace(request.MetodoPago))
            {
                return BadRequest(new
                {
                    mensaje = "Los datos del pedido están incompletos."
                });
            }


            // ==========================================
            // 3. VALIDAR DISTRITO
            // ==========================================

            var existeDistrito =
                await _pedidoDAO.ExisteDistritoAsync(
                    request.IdDistrito
                );

            if (!existeDistrito)
            {
                return BadRequest(new
                {
                    mensaje = "El distrito seleccionado no existe."
                });
            }


            // ==========================================
            // 4. OBTENER CARRITO COMPLETO
            // ==========================================

            var carrito =
                await _pedidoDAO.ObtenerCarritoCompletoAsync(
                    idUsuario
                );

            if (carrito == null || !carrito.Any())
            {
                return BadRequest(new
                {
                    mensaje = "El carrito está vacío."
                });
            }


            // ==========================================
            // 5. VALIDAR PRODUCTOS Y STOCK
            // ==========================================

            foreach (var item in carrito)
            {
                var producto =
                    item.IdProductoNavigation;

                if (producto == null)
                {
                    return BadRequest(new
                    {
                        mensaje =
                            "Uno de los productos del carrito ya no existe."
                    });
                }

                if (producto.IdTiendaNavigation == null)
                {
                    return BadRequest(new
                    {
                        mensaje =
                            $"El producto {producto.Nombre} no tiene una tienda válida."
                    });
                }

                if (producto.Activo != true)
                {
                    return BadRequest(new
                    {
                        mensaje =
                            $"El producto {producto.Nombre} ya no está disponible."
                    });
                }

                if (item.Cantidad <= 0)
                {
                    return BadRequest(new
                    {
                        mensaje =
                            $"La cantidad del producto {producto.Nombre} no es válida."
                    });
                }

                if (producto.Stock < item.Cantidad)
                {
                    return BadRequest(new
                    {
                        mensaje =
                            $"Stock insuficiente para {producto.Nombre}. " +
                            $"Disponible: {producto.Stock}, solicitado: {item.Cantidad}."
                    });
                }
            }


            // ==========================================
            // 6. AGRUPAR PRODUCTOS POR TIENDA
            // ==========================================

            var gruposPorTienda =
                carrito
                    .GroupBy(item =>
                        item.IdProductoNavigation!.IdTienda)
                    .ToList();


            // ==========================================
            // 6.1 VALIDAR MÉTODOS DE ENTREGA
            // ==========================================

            if (request.MetodosEntrega == null ||
                !request.MetodosEntrega.Any())
            {
                return BadRequest(new
                {
                    mensaje =
                        "Debe seleccionar un método de entrega para cada tienda."
                });
            }


            var tiendasDuplicadas =
                request.MetodosEntrega
                    .GroupBy(m => m.IdTienda)
                    .Where(g => g.Count() > 1)
                    .Select(g => g.Key)
                    .ToList();

            if (tiendasDuplicadas.Any())
            {
                return BadRequest(new
                {
                    mensaje =
                        "No puede seleccionar más de un método de entrega para la misma tienda.",

                    tiendasDuplicadas
                });
            }


            var idsTiendasCarrito =
                gruposPorTienda
                    .Select(g => g.Key)
                    .ToHashSet();


            var tiendasExtras =
                request.MetodosEntrega
                    .Where(m =>
                        !idsTiendasCarrito.Contains(m.IdTienda))
                    .Select(m => m.IdTienda)
                    .ToList();

            if (tiendasExtras.Any())
            {
                return BadRequest(new
                {
                    mensaje =
                        "Se enviaron métodos de entrega para tiendas que no pertenecen al carrito.",

                    tiendasExtras
                });
            }


            var metodosPorTienda =
                new Dictionary<int, string>();


            foreach (var grupo in gruposPorTienda)
            {
                int idTienda =
                    grupo.Key;


                var seleccion =
                    request.MetodosEntrega
                        .FirstOrDefault(m =>
                            m.IdTienda == idTienda);


                if (seleccion == null)
                {
                    string nombreTienda =
                        grupo.First()
                            .IdProductoNavigation!
                            .IdTiendaNavigation!
                            .NombreNegocio;

                    return BadRequest(new
                    {
                        mensaje =
                            $"Debe seleccionar un método de entrega para la tienda {nombreTienda}.",

                        idTienda
                    });
                }


                string tipoMetodo =
                    seleccion.TipoMetodo?
                        .Trim()
                        .ToUpper()
                    ?? "";


                var metodoActivo =
                    await _metodoEntregaDAO
                        .ObtenerMetodoActivoAsync(
                            idTienda,
                            tipoMetodo
                        );


                if (metodoActivo == null)
                {
                    string nombreTienda =
                        grupo.First()
                            .IdProductoNavigation!
                            .IdTiendaNavigation!
                            .NombreNegocio;

                    return BadRequest(new
                    {
                        mensaje =
                            $"El método de entrega {tipoMetodo} no está disponible " +
                            $"para la tienda {nombreTienda}.",

                        idTienda
                    });
                }


                metodosPorTienda[idTienda] =
                    metodoActivo.TipoMetodo;
            }


            // ==========================================
            // 6.2 VALIDAR COBERTURA SEGÚN MÉTODO
            // ==========================================

            var coberturasPorTienda =
                new Dictionary<int, CoberturaTienda?>();

            var costosEnvioPorTienda =
                new Dictionary<int, decimal>();


            foreach (var grupo in gruposPorTienda)
            {
                int idTienda =
                    grupo.Key;

                string metodoEntrega =
                    metodosPorTienda[idTienda];


                if (metodoEntrega == "RECOGER_TIENDA")
                {
                    coberturasPorTienda[idTienda] =
                        null;

                    costosEnvioPorTienda[idTienda] =
                        0m;

                    continue;
                }


                var cobertura =
                    await _coberturaDAO
                        .ObtenerCoberturaActivaAsync(
                            idTienda,
                            request.IdDistrito
                        );


                if (cobertura == null)
                {
                    string nombreTienda =
                        grupo.First()
                            .IdProductoNavigation!
                            .IdTiendaNavigation!
                            .NombreNegocio;

                    return BadRequest(new
                    {
                        mensaje =
                            $"La tienda {nombreTienda} no realiza entregas " +
                            $"al distrito seleccionado.",

                        idTienda,

                        metodoEntrega
                    });
                }


                coberturasPorTienda[idTienda] =
                    cobertura;

                costosEnvioPorTienda[idTienda] =
                    cobertura.CostoEnvio;
            }


            // ==========================================
            // 6.3 CALCULAR TOTAL GENERAL
            // ==========================================

            decimal subtotalPedido =
                carrito.Sum(item =>
                    item.IdProductoNavigation!.Precio *
                    item.Cantidad
                );


            decimal costoEnvioPedido =
                costosEnvioPorTienda.Values
                    .Sum();


            decimal totalPedido =
                subtotalPedido +
                costoEnvioPedido;


            // ==========================================
            // 7. INICIAR TRANSACCIÓN
            // ==========================================

            await using var transaction =
                await _pedidoDAO.IniciarTransaccionAsync();


            try
            {
                // ======================================
                // 8. CREAR PEDIDO
                // ======================================

                var pedido = new Pedido
                {
                    IdUsuario =
                        idUsuario,

                    IdDistrito =
                        request.IdDistrito,

                    Subtotal =
                        subtotalPedido,

                    CostoEnvio =
                        costoEnvioPedido,

                    Total =
                        totalPedido,

                    DireccionEntrega =
                        request.DireccionEntrega,

                    Telefono =
                        request.Telefono,

                    MetodoPago =
                        request.MetodoPago,

                    Estado =
                        "PENDIENTE",

                    FechaPedido =
                        DateTime.Now
                };


                await _pedidoDAO
                    .CrearPedidoAsync(
                        pedido
                    );


                // ======================================
                // 9. CREAR SUBPEDIDOS
                // ======================================

                foreach (var grupo in gruposPorTienda)
                {
                    int idTienda =
                        grupo.Key;


                    decimal subtotalSubPedido =
                        grupo.Sum(item =>
                            item.IdProductoNavigation!.Precio *
                            item.Cantidad
                        );


                    decimal costoEnvioSubPedido =
                        costosEnvioPorTienda[idTienda];


                    // ==================================
                    // COMISIÓN DE LA PLATAFORMA
                    // 5% DEL SUBTOTAL DEL SUBPEDIDO
                    // ==================================

                    const decimal porcentajeComision =
                        0.05m;


                    decimal comisionPlataforma =
                        Math.Round(
                            subtotalSubPedido *
                            porcentajeComision,
                            2
                        );


                    decimal totalVendedor =
                        Math.Round(
                            subtotalSubPedido -
                            comisionPlataforma,
                            2
                        );


                    var subPedido =
                        new SubPedido
                        {
                            IdPedido =
                                pedido.IdPedido,

                            IdTienda =
                                idTienda,

                            Subtotal =
                                subtotalSubPedido,

                            CostoEnvio =
                                costoEnvioSubPedido,

                            MetodoEntrega =
                                metodosPorTienda[idTienda],

                            ComisionPlataforma =
                                comisionPlataforma,

                            TotalVendedor =
                                totalVendedor,

                            Estado =
                                "PENDIENTE",

                            FechaActualizacion =
                                DateTime.Now
                        };


                    await _pedidoDAO
                        .CrearSubPedidoAsync(
                            subPedido
                        );


                    // ==================================
                    // CREAR INFORMACIÓN DE ENTREGA
                    // ==================================

                    var entrega =
                        new EntregaSubPedido
                        {
                            IdSubPedido =
                                subPedido.IdSubPedido,

                            MetodoEntrega =
                                subPedido.MetodoEntrega!,

                            EstadoEntrega =
                                "PENDIENTE",

                            ProveedorEntrega =
                                null,

                            CodigoSeguimiento =
                                null,

                            FechaCreacion =
                                DateTime.Now,

                            FechaActualizacion =
                                DateTime.Now,

                            FechaEntrega =
                                null
                        };


                    await _pedidoDAO
                        .CrearEntregaSubPedidoAsync(
                            entrega
                        );


                    // ==================================
                    // 10. DETALLES + DESCONTAR STOCK
                    // ==================================

                    foreach (var item in grupo)
                    {
                        var producto =
                            item.IdProductoNavigation!;


                        decimal precioUnitario =
                            producto.Precio;


                        decimal descuento =
                            0m;


                        decimal subtotalDetalle =
                            precioUnitario *
                            item.Cantidad;


                        var detalle =
                            new DetalleSubPedido
                            {
                                IdSubPedido =
                                    subPedido.IdSubPedido,

                                IdProducto =
                                    producto.IdProducto,

                                Cantidad =
                                    item.Cantidad,

                                PrecioUnitario =
                                    precioUnitario,

                                Descuento =
                                    descuento,

                                Subtotal =
                                    subtotalDetalle
                            };


                        await _pedidoDAO
                            .CrearDetalleSubPedidoAsync(
                                detalle
                            );


                        // ==================================
                        // DESCONTAR STOCK + REGISTRAR VENTA
                        // ==================================

                        var inventario =
                            await _pedidoDAO
                                .ObtenerInventarioPorProductoAsync(
                                    producto.IdProducto
                                );


                        if (inventario == null)
                        {
                            throw new Exception(
                                $"No existe inventario para el producto {producto.Nombre}."
                            );
                        }


                        int stockAnterior =
                            inventario.StockActual;


                        if (stockAnterior < item.Cantidad)
                        {
                            throw new Exception(
                                $"Stock insuficiente en inventario para {producto.Nombre}."
                            );
                        }


                        int stockNuevo =
                            stockAnterior -
                            item.Cantidad;


                        inventario.StockActual =
                            stockNuevo;

                        inventario.FechaActualizacion =
                            DateTime.Now;


                        await _pedidoDAO
                            .ActualizarInventarioAsync(
                                inventario
                            );


                        producto.Stock =
                            stockNuevo;


                        await _pedidoDAO
                            .ActualizarProductoAsync(
                                producto
                            );


                        var movimiento =
                            new MovimientoInventario
                            {
                                IdInventario =
                                    inventario.IdInventario,

                                TipoMovimiento =
                                    "VENTA",

                                Cantidad =
                                    item.Cantidad,

                                StockAnterior =
                                    stockAnterior,

                                StockNuevo =
                                    stockNuevo,

                                Motivo =
                                    "Venta realizada mediante checkout",

                                Referencia =
                                    $"PEDIDO #{pedido.IdPedido}",

                                FechaMovimiento =
                                    DateTime.Now
                            };


                        await _pedidoDAO
                            .RegistrarMovimientoInventarioAsync(
                                movimiento
                            );
                    }
                }


                // ======================================
                // 11. VACIAR CARRITO
                // ======================================

                await _pedidoDAO
                    .VaciarCarritoAsync(
                        idUsuario
                    );


                // ======================================
                // 12. COMMIT
                // ======================================

                await transaction.CommitAsync();


                // ======================================
                // 13. RESPUESTA
                // ======================================

                return Ok(new
                {
                    mensaje =
                        "Pedido realizado correctamente.",

                    idPedido =
                        pedido.IdPedido,

                    subtotal =
                        pedido.Subtotal,

                    costoEnvio =
                        pedido.CostoEnvio,

                    total =
                        pedido.Total,

                    cantidadTiendas =
                        gruposPorTienda.Count,

                    metodosEntrega =
                        metodosPorTienda.Select(m => new
                        {
                            idTienda =
                                m.Key,

                            tipoMetodo =
                                m.Value
                        })
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();

                Console.WriteLine(
                    $"Error al procesar pedido: {ex}"
                );

                return StatusCode(500, new
                {
                    mensaje =
                        "Ocurrió un error interno al procesar el pedido."
                });
            }
        }

        // ==========================================
        // CAMBIAR ESTADO LOGÍSTICO DE ENTREGA
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPut("CambiarEstadoEntrega")]
        public async Task<IActionResult> CambiarEstadoEntrega(
            [FromBody] CambiarEstadoEntregaRequest request)
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

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


            // ==========================================
            // 2. VALIDAR REQUEST
            // ==========================================

            if (request == null ||
                request.IdSubPedido <= 0 ||
                string.IsNullOrWhiteSpace(
                    request.EstadoEntrega))
            {
                return BadRequest(new
                {
                    mensaje =
                        "Los datos enviados no son válidos."
                });
            }


            // ==========================================
            // 3. NORMALIZAR ESTADO
            // ==========================================

            string nuevoEstado =
                request.EstadoEntrega
                    .Trim()
                    .ToUpperInvariant();


            // ==========================================
            // 4. BUSCAR ENTREGA
            // ==========================================

            var entrega =
                await _pedidoDAO
                    .ObtenerEntregaPorSubPedidoAsync(
                        request.IdSubPedido
                    );


            if (entrega == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No existe información de entrega para este subpedido."
                });
            }


            // ==========================================
            // 5. VALIDAR PROPIEDAD DE LA TIENDA
            // ==========================================

            var subPedido =
                entrega.IdSubPedidoNavigation;


            if (subPedido == null ||
                subPedido.IdTiendaNavigation == null)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El subpedido no tiene una tienda válida."
                });
            }


            if (subPedido.IdTiendaNavigation.IdVendedor
                != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar esta entrega."
                });
            }


            // ==========================================
            // 6. OBTENER ESTADO ACTUAL Y MÉTODO
            // ==========================================

            string estadoActual =
                entrega.EstadoEntrega
                    .Trim()
                    .ToUpperInvariant();


            string metodoEntrega =
                entrega.MetodoEntrega
                    .Trim()
                    .ToUpperInvariant();


            // ==========================================
            // 7. NO MODIFICAR SI YA TERMINÓ
            // ==========================================

            if (estadoActual == "ENTREGADO")
            {
                return BadRequest(new
                {
                    mensaje =
                        "La entrega ya fue completada y no puede modificarse."
                });
            }


            if (estadoActual == "CANCELADO")
            {
                return BadRequest(new
                {
                    mensaje =
                        "La entrega está cancelada y no puede modificarse."
                });
            }


            // ==========================================
            // 8. VALIDAR TRANSICIÓN
            // ==========================================

            bool transicionValida =
                false;


            if (metodoEntrega == "TIENDA" ||
                metodoEntrega == "ALIADO")
            {
                transicionValida =
                    (estadoActual == "PENDIENTE" &&
                     nuevoEstado == "LISTO_PARA_ENVIO")

                    ||

                    (estadoActual == "LISTO_PARA_ENVIO" &&
                     nuevoEstado == "EN_CAMINO")

                    ||

                    (estadoActual == "EN_CAMINO" &&
                     nuevoEstado == "ENTREGADO")

                    ||

                    (nuevoEstado == "CANCELADO");
            }


            else if (metodoEntrega ==
                     "RECOGER_TIENDA")
            {
                transicionValida =
                    (estadoActual == "PENDIENTE" &&
                     nuevoEstado == "LISTO_PARA_RECOGER")

                    ||

                    (estadoActual == "LISTO_PARA_RECOGER" &&
                     nuevoEstado == "ENTREGADO")

                    ||

                    (nuevoEstado == "CANCELADO");
            }


            if (!transicionValida)
            {
                return BadRequest(new
                {
                    mensaje =
                        $"No se puede cambiar de {estadoActual} " +
                        $"a {nuevoEstado} para el método {metodoEntrega}.",

                    estadoActual,
                    nuevoEstado,
                    metodoEntrega
                });
            }


            // ==========================================
            // 9. GUARDAR ESTADO ANTERIOR
            // ==========================================

            string estadoAnterior =
                estadoActual;


            // ==========================================
            // 10. ACTUALIZAR ESTADO DE ENTREGA
            // ==========================================

            entrega.EstadoEntrega =
                nuevoEstado;

            entrega.FechaActualizacion =
                DateTime.Now;


            if (nuevoEstado == "ENTREGADO")
            {
                entrega.FechaEntrega =
                    DateTime.Now;
            }


            await _pedidoDAO
                .ActualizarEntregaSubPedidoAsync(
                    entrega
                );


            // ==========================================
            // 11. REGISTRAR HISTORIAL DE ENTREGA
            // ==========================================

            var historial =
                new HistorialEntrega
                {
                    IdEntrega =
                        entrega.IdEntrega,

                    EstadoAnterior =
                        estadoAnterior,

                    EstadoNuevo =
                        nuevoEstado,

                    FechaCambio =
                        DateTime.Now,

                    Observacion =
                        null
                };


            await _pedidoDAO
                .RegistrarHistorialEntregaAsync(
                    historial
                );


            // ==========================================
            // 12. SINCRONIZAR SUBPEDIDO
            // ==========================================

            await _pedidoDAO
                .SincronizarEstadoSubPedidoAsync(
                    entrega.IdSubPedido,
                    entrega.EstadoEntrega
                );


            // ==========================================
            // 13. SINCRONIZAR PEDIDO PRINCIPAL
            // ==========================================

            await _pedidoDAO
                .SincronizarEstadoPedidoAsync(
                    subPedido.IdPedido
                );


            // ==========================================
            // 14. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Estado de entrega actualizado correctamente.",

                entrega.IdEntrega,

                entrega.IdSubPedido,

                entrega.MetodoEntrega,

                entrega.EstadoEntrega,

                entrega.FechaActualizacion,

                entrega.FechaEntrega
            });
        }

        // ==========================================
        // ACTUALIZAR SEGUIMIENTO DE ENTREGA
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPut("ActualizarSeguimientoEntrega")]
        public async Task<IActionResult> ActualizarSeguimientoEntrega(
            [FromBody] ActualizarSeguimientoEntregaRequest request)
        {
            // ==========================================
            // 1. OBTENER VENDEDOR DESDE JWT
            // ==========================================

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


            // ==========================================
            // 2. VALIDAR REQUEST
            // ==========================================

            if (request == null ||
                request.IdSubPedido <= 0 ||
                string.IsNullOrWhiteSpace(
                    request.ProveedorEntrega) ||
                string.IsNullOrWhiteSpace(
                    request.CodigoSeguimiento))
            {
                return BadRequest(new
                {
                    mensaje =
                        "Debe proporcionar el proveedor y el código de seguimiento."
                });
            }


            // ==========================================
            // 3. NORMALIZAR DATOS
            // ==========================================

            string proveedorEntrega =
                request.ProveedorEntrega.Trim();

            string codigoSeguimiento =
                request.CodigoSeguimiento.Trim();


            // ==========================================
            // 4. VALIDAR LONGITUDES
            // ==========================================

            if (proveedorEntrega.Length > 100)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El proveedor de entrega no puede superar los 100 caracteres."
                });
            }

            if (codigoSeguimiento.Length > 100)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El código de seguimiento no puede superar los 100 caracteres."
                });
            }


            // ==========================================
            // 5. BUSCAR ENTREGA
            // ==========================================

            var entrega =
                await _pedidoDAO
                    .ObtenerEntregaPorSubPedidoAsync(
                        request.IdSubPedido
                    );

            if (entrega == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No existe información de entrega para este subpedido."
                });
            }


            // ==========================================
            // 6. VALIDAR PROPIEDAD DE LA TIENDA
            // ==========================================

            var subPedido =
                entrega.IdSubPedidoNavigation;

            if (subPedido == null ||
                subPedido.IdTiendaNavigation == null)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El subpedido no tiene una tienda válida."
                });
            }


            if (subPedido.IdTiendaNavigation.IdVendedor
                != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar esta entrega."
                });
            }


            // ==========================================
            // 7. VALIDAR MÉTODO DE ENTREGA
            // ==========================================

            string metodoEntrega =
                entrega.MetodoEntrega
                    .Trim()
                    .ToUpperInvariant();

            if (metodoEntrega != "ALIADO")
            {
                return BadRequest(new
                {
                    mensaje =
                        "El proveedor y código de seguimiento solo aplican a entregas mediante ALIADO."
                });
            }


            // ==========================================
            // 8. VALIDAR ESTADO DE LA ENTREGA
            // ==========================================

            string estadoActual =
                entrega.EstadoEntrega
                    .Trim()
                    .ToUpperInvariant();

            if (estadoActual == "ENTREGADO" ||
                estadoActual == "CANCELADO")
            {
                return BadRequest(new
                {
                    mensaje =
                        "No se puede modificar el seguimiento de una entrega finalizada o cancelada."
                });
            }


            // ==========================================
            // 9. ACTUALIZAR SEGUIMIENTO
            // ==========================================

            entrega.ProveedorEntrega =
                proveedorEntrega;

            entrega.CodigoSeguimiento =
                codigoSeguimiento;

            entrega.FechaActualizacion =
                DateTime.Now;


            await _pedidoDAO
                .ActualizarEntregaSubPedidoAsync(
                    entrega
                );


            // ==========================================
            // 10. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Información de seguimiento actualizada correctamente.",

                entrega.IdEntrega,

                entrega.IdSubPedido,

                entrega.MetodoEntrega,

                entrega.EstadoEntrega,

                entrega.ProveedorEntrega,

                entrega.CodigoSeguimiento,

                entrega.FechaActualizacion
            });
        }

        // ==========================================
        // CONSULTAR HISTORIAL DE ENTREGA
        // ==========================================

        [Authorize(Roles = "Cliente,Vendedor")]
        [HttpGet("HistorialEntrega/{idSubPedido}")]
        public async Task<IActionResult> HistorialEntrega(
            int idSubPedido)
        {
            // ==========================================
            // 1. OBTENER USUARIO DESDE JWT
            // ==========================================

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
            // 2. VALIDAR ID
            // ==========================================

            if (idSubPedido <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El identificador del subpedido no es válido."
                });
            }


            // ==========================================
            // 3. BUSCAR ENTREGA
            // ==========================================

            var entrega =
                await _pedidoDAO
                    .ObtenerEntregaPorSubPedidoAsync(
                        idSubPedido
                    );

            if (entrega == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No existe información de entrega para este subpedido."
                });
            }


            var subPedido =
                entrega.IdSubPedidoNavigation;

            if (subPedido == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "No se encontró el subpedido."
                });
            }


            // ==========================================
            // 4. VALIDAR ACCESO SEGÚN ROL
            // ==========================================

            bool esCliente =
                User.IsInRole("Cliente");

            bool esVendedor =
                User.IsInRole("Vendedor");


            if (esCliente)
            {
                var pedido =
                    await _pedidoDAO
                        .ObtenerPedidoPorIdAsync(
                            subPedido.IdPedido
                        );

                if (pedido == null ||
                    pedido.IdUsuario != idUsuario)
                {
                    return StatusCode(403, new
                    {
                        mensaje =
                            "No tiene permiso para consultar esta entrega."
                    });
                }
            }


            else if (esVendedor)
            {
                if (subPedido.IdTiendaNavigation == null ||
                    subPedido.IdTiendaNavigation.IdVendedor
                        != idUsuario)
                {
                    return StatusCode(403, new
                    {
                        mensaje =
                            "No tiene permiso para consultar esta entrega."
                    });
                }
            }


            else
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para consultar esta entrega."
                });
            }


            // ==========================================
            // 5. OBTENER HISTORIAL
            // ==========================================

            var historial =
                await _pedidoDAO
                    .ObtenerHistorialEntregaAsync(
                        idSubPedido
                    );


            // ==========================================
            // 6. RESPUESTA
            // ==========================================

            return Ok(new
            {
                entrega.IdSubPedido,

                entrega.IdEntrega,

                entrega.MetodoEntrega,

                EstadoActual =
                    entrega.EstadoEntrega,

                entrega.ProveedorEntrega,

                entrega.CodigoSeguimiento,

                entrega.FechaCreacion,

                entrega.FechaActualizacion,

                entrega.FechaEntrega,

                Historial =
                    historial.Select(h => new
                    {
                        h.IdHistorial,

                        h.EstadoAnterior,

                        h.EstadoNuevo,

                        h.FechaCambio,

                        h.Observacion
                    })
                    .ToList()
            });
        }


        // ==========================================
        // MIS PEDIDOS - CLIENTE
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpGet("MisPedidos")]
        public async Task<IActionResult> MisPedidos()
        {
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }


            var pedidos =
                await _pedidoDAO.ObtenerPedidosPorUsuarioAsync(
                    idUsuario
                );


            if (pedidos == null ||
                !pedidos.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No tiene pedidos registrados."
                });
            }


            var resultado =
                pedidos.Select(p => new
                {
                    p.IdPedido,
                    p.FechaPedido,
                    p.Estado,
                    p.Subtotal,
                    p.CostoEnvio,
                    p.Total,
                    p.DireccionEntrega,
                    p.Telefono,
                    p.MetodoPago,

                    SubPedidos =
                        p.SubPedidos.Select(sp => new
                        {
                            sp.IdSubPedido,
                            sp.IdTienda,
                            sp.Estado,
                            sp.Subtotal,
                            sp.CostoEnvio,
                            sp.ComisionPlataforma,
                            sp.TotalVendedor,

                            Entrega =
                                sp.EntregaSubPedido != null
                                    ? new
                                    {
                                        sp.EntregaSubPedido.IdEntrega,
                                        sp.EntregaSubPedido.MetodoEntrega,
                                        sp.EntregaSubPedido.EstadoEntrega,
                                        sp.EntregaSubPedido.ProveedorEntrega,
                                        sp.EntregaSubPedido.CodigoSeguimiento,
                                        sp.EntregaSubPedido.FechaCreacion,
                                        sp.EntregaSubPedido.FechaActualizacion,
                                        sp.EntregaSubPedido.FechaEntrega
                                    }
                                    : null,

                            Productos =
                                sp.Detalles.Select(d => new
                                {
                                    d.IdProducto,

                                    Nombre =
                                        d.IdProductoNavigation != null
                                            ? d.IdProductoNavigation.Nombre
                                            : "Producto no disponible",

                                    d.Cantidad,
                                    d.PrecioUnitario,
                                    d.Descuento,
                                    d.Subtotal
                                })
                        })
                })
                .ToList();


            return Ok(resultado);
        }

        // ==========================================
        // MI PEDIDO POR ID - CLIENTE
        // ==========================================

        [Authorize(Roles = "Cliente")]
        [HttpGet("MiPedido/{idPedido}")]
        public async Task<IActionResult> MiPedido(
            int idPedido)
        {
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idUsuario))
            {
                return Unauthorized(new
                {
                    mensaje = "No se pudo identificar al usuario."
                });
            }

            var pedido =
                await _pedidoDAO.ObtenerPedidoPorIdAsync(
                    idPedido
                );

            if (pedido == null)
            {
                return NotFound(new
                {
                    mensaje = "El pedido no existe."
                });
            }

            if (pedido.IdUsuario != idUsuario)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para consultar este pedido."
                });
            }

            var resultado = new
            {
                pedido.IdPedido,
                pedido.FechaPedido,
                pedido.Estado,
                pedido.Subtotal,
                pedido.CostoEnvio,
                pedido.Total,
                pedido.DireccionEntrega,
                pedido.Telefono,
                pedido.MetodoPago,

                SubPedidos =
                    pedido.SubPedidos.Select(sp => new
                    {
                        sp.IdSubPedido,
                        sp.IdTienda,
                        sp.Estado,
                        sp.Subtotal,
                        sp.CostoEnvio,
                        sp.ComisionPlataforma,
                        sp.TotalVendedor,

                        Entrega =
                            sp.EntregaSubPedido != null
                                ? new
                                {
                                    sp.EntregaSubPedido.IdEntrega,
                                    sp.EntregaSubPedido.MetodoEntrega,
                                    sp.EntregaSubPedido.EstadoEntrega,
                                    sp.EntregaSubPedido.ProveedorEntrega,
                                    sp.EntregaSubPedido.CodigoSeguimiento,
                                    sp.EntregaSubPedido.FechaCreacion,
                                    sp.EntregaSubPedido.FechaActualizacion,
                                    sp.EntregaSubPedido.FechaEntrega
                                }
                                : null,

                        Productos =
                            sp.Detalles.Select(d => new
                            {
                                d.IdProducto,

                                Nombre =
                                    d.IdProductoNavigation != null
                                        ? d.IdProductoNavigation.Nombre
                                        : "Producto no disponible",

                                d.Cantidad,
                                d.PrecioUnitario,
                                d.Descuento,
                                d.Subtotal
                            })
                    })
            };

            return Ok(resultado);
        }

        // ==========================================
        // PEDIDOS DE MIS TIENDAS - VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpGet("PedidosTienda")]
        public async Task<IActionResult> PedidosTienda()
        {
            var idUsuarioClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(idUsuarioClaim, out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var subPedidos =
                await _pedidoDAO
                    .ObtenerSubPedidosPorVendedorAsync(
                        idVendedor
                    );


            if (subPedidos == null ||
                !subPedidos.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No tiene pedidos registrados en sus tiendas."
                });
            }


            var resultado =
                subPedidos.Select(sp => new
                {
                    sp.IdSubPedido,
                    sp.IdPedido,
                    sp.IdTienda,

                    Tienda =
                        sp.IdTiendaNavigation != null
                            ? sp.IdTiendaNavigation.NombreNegocio
                            : "Tienda no disponible",

                    sp.Estado,
                    sp.Subtotal,
                    sp.CostoEnvio,
                    sp.ComisionPlataforma,
                    sp.TotalVendedor,
                    sp.FechaActualizacion,


                    // ======================================
                    // INFORMACIÓN DE ENTREGA
                    // ======================================

                    Entrega =
                        sp.EntregaSubPedido != null
                            ? new
                            {
                                sp.EntregaSubPedido.IdEntrega,

                                sp.EntregaSubPedido.MetodoEntrega,

                                sp.EntregaSubPedido.EstadoEntrega,

                                sp.EntregaSubPedido.ProveedorEntrega,

                                sp.EntregaSubPedido.CodigoSeguimiento,

                                sp.EntregaSubPedido.FechaCreacion,

                                sp.EntregaSubPedido.FechaActualizacion,

                                sp.EntregaSubPedido.FechaEntrega
                            }
                            : null,


                    // ======================================
                    // INFORMACIÓN GENERAL DEL PEDIDO
                    // ======================================

                    Pedido = new
                    {
                        FechaPedido =
                            sp.IdPedidoNavigation != null
                                ? sp.IdPedidoNavigation.FechaPedido
                                : DateTime.MinValue,

                        DireccionEntrega =
                            sp.IdPedidoNavigation != null
                                ? sp.IdPedidoNavigation.DireccionEntrega
                                : "",

                        Telefono =
                            sp.IdPedidoNavigation != null
                                ? sp.IdPedidoNavigation.Telefono
                                : "",

                        MetodoPago =
                            sp.IdPedidoNavigation != null
                                ? sp.IdPedidoNavigation.MetodoPago
                                : ""
                    },


                    // ======================================
                    // PRODUCTOS DEL SUBPEDIDO
                    // ======================================

                    Productos =
                        sp.Detalles.Select(d => new
                        {
                            d.IdProducto,

                            Nombre =
                                d.IdProductoNavigation != null
                                    ? d.IdProductoNavigation.Nombre
                                    : "Producto no disponible",

                            d.Cantidad,
                            d.PrecioUnitario,
                            d.Descuento,
                            d.Subtotal
                        })
                })
                .ToList();


            return Ok(resultado);
        }


        // ==========================================
        // CAMBIAR ESTADO DEL SUBPEDIDO - VENDEDOR
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPut("CambiarEstado")]
        public async Task<IActionResult> CambiarEstado(
            [FromBody] CambiarEstadoSubPedidoRequest request)
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
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            // ==========================================
            // 2. VALIDAR REQUEST
            // ==========================================

            if (request == null ||
                request.IdSubPedido <= 0 ||
                string.IsNullOrWhiteSpace(request.Estado))
            {
                return BadRequest(new
                {
                    mensaje =
                        "Los datos enviados no son válidos."
                });
            }


            // ==========================================
            // 3. NORMALIZAR ESTADO
            // ==========================================

            string nuevoEstado =
                request.Estado
                    .Trim()
                    .ToUpper();


            // ==========================================
            // 4. VALIDAR ESTADO PERMITIDO
            // ==========================================

            string[] estadosPermitidos =
            {
                "PENDIENTE",
                "CONFIRMADO",
                "PREPARANDO",
                "ENVIADO",
                "ENTREGADO",
                "CANCELADO"
            };


            if (!estadosPermitidos.Contains(nuevoEstado))
            {
                return BadRequest(new
                {
                    mensaje =
                        "El estado indicado no es válido.",

                    estadosPermitidos
                });
            }


            // ==========================================
            // 5. BUSCAR SUBPEDIDO
            // ==========================================

            var subPedido =
                await _pedidoDAO
                    .ObtenerSubPedidoPorIdAsync(
                        request.IdSubPedido
                    );


            if (subPedido == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El subpedido no existe."
                });
            }


            // ==========================================
            // 6. VALIDAR QUE LA TIENDA SEA DEL VENDEDOR
            // ==========================================

            if (subPedido.IdTiendaNavigation == null ||
                subPedido.IdTiendaNavigation.IdVendedor != idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para modificar este subpedido."
                });
            }


            // ==========================================
            // 7. ACTUALIZAR ESTADO
            // ==========================================

            subPedido.Estado =
                nuevoEstado;

            subPedido.FechaActualizacion =
                DateTime.Now;


            await _pedidoDAO
                .ActualizarSubPedidoAsync(
                    subPedido
                );


            // ==========================================
            // 8. RESPUESTA
            // ==========================================

            return Ok(new
            {
                mensaje =
                    "Estado del pedido actualizado correctamente.",

                idSubPedido =
                    subPedido.IdSubPedido,

                estado =
                    subPedido.Estado,

                fechaActualizacion =
                    subPedido.FechaActualizacion
            });
        }


        // ==========================================
        // TODOS LOS PEDIDOS - ADMINISTRADOR
        // ==========================================

        [Authorize(Roles = "Administrador")]
        [HttpGet("TodosLosPedidos")]
        public async Task<IActionResult> TodosLosPedidos()
        {
            var pedidos =
                await _pedidoDAO.ObtenerTodosLosPedidosAsync();

            if (pedidos == null ||
                !pedidos.Any())
            {
                return NotFound(new
                {
                    mensaje =
                        "No hay pedidos registrados."
                });
            }

            var resultado =
                pedidos.Select(p => new
                {
                    p.IdPedido,
                    p.FechaPedido,
                    p.Estado,
                    p.Subtotal,
                    p.CostoEnvio,
                    p.Total,
                    p.DireccionEntrega,
                    p.Telefono,
                    p.MetodoPago,

                    Cliente = new
                    {
                        IdUsuario =
                            p.IdUsuario,

                        Nombres =
                            p.IdUsuarioNavigation != null
                                ? p.IdUsuarioNavigation.Nombres
                                : "",

                        Apellidos =
                            p.IdUsuarioNavigation != null
                                ? p.IdUsuarioNavigation.Apellidos
                                : "",

                        Correo =
                            p.IdUsuarioNavigation != null
                                ? p.IdUsuarioNavigation.Correo
                                : ""
                    },

                    SubPedidos =
                        p.SubPedidos.Select(sp => new
                        {
                            sp.IdSubPedido,
                            sp.IdTienda,

                            Tienda =
                                sp.IdTiendaNavigation != null
                                    ? sp.IdTiendaNavigation.NombreNegocio
                                    : "Tienda no disponible",

                            sp.Estado,
                            sp.Subtotal,
                            sp.CostoEnvio,
                            sp.ComisionPlataforma,
                            sp.TotalVendedor,
                            sp.FechaActualizacion,

                            Productos =
                                sp.Detalles.Select(d => new
                                {
                                    d.IdProducto,

                                    Nombre =
                                        d.IdProductoNavigation != null
                                            ? d.IdProductoNavigation.Nombre
                                            : "Producto no disponible",

                                    d.Cantidad,
                                    d.PrecioUnitario,
                                    d.Descuento,
                                    d.Subtotal
                                })
                        })
                })
                .ToList();

            return Ok(resultado);
        }





    }
}