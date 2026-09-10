using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace ChiringuitoCH_Data.DAO
{
    public class PedidoDAO
    {
        private readonly ChChatarra40Context _context;

        public PedidoDAO(ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER CARRITO COMPLETO DEL USUARIO
        // ==========================================

        public async Task<List<Carrito>> ObtenerCarritoCompletoAsync(
            int idUsuario)
        {
            return await _context.Carritos
                .Where(c => c.IdUsuario == idUsuario)
                .Include(c => c.IdProductoNavigation)
                    .ThenInclude(p => p.IdTiendaNavigation)
                .ToListAsync();
        }


        // ==========================================
        // VERIFICAR QUE EXISTA DISTRITO
        // ==========================================

        public async Task<bool> ExisteDistritoAsync(
            int idDistrito)
        {
            return await _context.Distritos
                .AnyAsync(d => d.IdDistrito == idDistrito);
        }


        // ==========================================
        // CREAR PEDIDO PRINCIPAL
        // ==========================================

        public async Task<Pedido> CrearPedidoAsync(
            Pedido pedido)
        {
            _context.Pedidos.Add(pedido);

            await _context.SaveChangesAsync();

            return pedido;
        }


        // ==========================================
        // CREAR SUBPEDIDO
        // ==========================================

        public async Task<SubPedido> CrearSubPedidoAsync(
            SubPedido subPedido)
        {
            _context.SubPedidos.Add(subPedido);

            await _context.SaveChangesAsync();

            return subPedido;
        }


        // ==========================================
        // CREAR DETALLE DE SUBPEDIDO
        // ==========================================

        public async Task CrearDetalleSubPedidoAsync(
            DetalleSubPedido detalle)
        {
            _context.DetalleSubPedidos.Add(detalle);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR PRODUCTO
        // ==========================================

        public async Task ActualizarProductoAsync(
            Producto producto)
        {
            _context.Productos.Update(producto);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // VACIAR CARRITO
        // ==========================================

        public async Task VaciarCarritoAsync(
            int idUsuario)
        {
            var carrito =
                await _context.Carritos
                    .Where(c => c.IdUsuario == idUsuario)
                    .ToListAsync();

            if (carrito.Any())
            {
                _context.Carritos.RemoveRange(carrito);

                await _context.SaveChangesAsync();
            }
        }


        // ==========================================
        // INICIAR TRANSACCIÓN
        // ==========================================

        public async Task<IDbContextTransaction>
            IniciarTransaccionAsync()
        {
            return await _context.Database
                .BeginTransactionAsync();
        }


        // ==========================================
        // OBTENER PEDIDO POR ID
        // ==========================================

        public async Task<Pedido?> ObtenerPedidoPorIdAsync(
            int idPedido)
        {
            return await _context.Pedidos

                // ==========================================
                // CARGAR ENTREGA DE CADA SUBPEDIDO
                // ==========================================

                .Include(p =>
                    p.SubPedidos)

                    .ThenInclude(sp =>
                        sp.EntregaSubPedido)

                // ==========================================
                // CARGAR PRODUCTOS DE CADA SUBPEDIDO
                // ==========================================

                .Include(p =>
                    p.SubPedidos)

                    .ThenInclude(sp =>
                        sp.Detalles)

                        .ThenInclude(d =>
                            d.IdProductoNavigation)

                // ==========================================
                // BUSCAR PEDIDO
                // ==========================================

                .FirstOrDefaultAsync(
                    p => p.IdPedido == idPedido
                );
        }


        // ==========================================
        // OBTENER PEDIDOS DEL CLIENTE
        // ==========================================

        public async Task<List<Pedido>>
            ObtenerPedidosPorUsuarioAsync(
                int idUsuario)
        {
            return await _context.Pedidos

                .Where(p =>
                    p.IdUsuario == idUsuario)

                // ==========================================
                // CARGAR ENTREGA DE CADA SUBPEDIDO
                // ==========================================

                .Include(p =>
                    p.SubPedidos)

                    .ThenInclude(sp =>
                        sp.EntregaSubPedido)

                // ==========================================
                // CARGAR PRODUCTOS DE CADA SUBPEDIDO
                // ==========================================

                .Include(p =>
                    p.SubPedidos)

                    .ThenInclude(sp =>
                        sp.Detalles)

                        .ThenInclude(d =>
                            d.IdProductoNavigation)

                .OrderByDescending(p =>
                    p.FechaPedido)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER SUBPEDIDOS DEL VENDEDOR
        // ==========================================

        public async Task<List<SubPedido>>
            ObtenerSubPedidosPorVendedorAsync(
                int idVendedor)
                {
                    return await _context.SubPedidos

                        .Include(sp =>
                            sp.IdTiendaNavigation)

                        .Include(sp =>
                            sp.IdPedidoNavigation)

                        .Include(sp =>
                            sp.EntregaSubPedido)

                        .Include(sp =>
                            sp.Detalles)

                            .ThenInclude(d =>
                                d.IdProductoNavigation)

                        .Where(sp =>
                            sp.IdTiendaNavigation != null &&
                            sp.IdTiendaNavigation.IdVendedor ==
                                idVendedor)

                        .OrderByDescending(sp =>
                            sp.IdPedido)

                        .ToListAsync();
                }


        // ==========================================
        // OBTENER SUBPEDIDO POR ID
        // ==========================================

        public async Task<SubPedido?>
            ObtenerSubPedidoPorIdAsync(
                int idSubPedido)
        {
            return await _context.SubPedidos

                .Include(sp =>
                    sp.IdTiendaNavigation)

                .Include(sp =>
                    sp.IdPedidoNavigation)

                .Include(sp =>
                    sp.Detalles)
                    .ThenInclude(d =>
                        d.IdProductoNavigation)

                .FirstOrDefaultAsync(
                    sp =>
                        sp.IdSubPedido == idSubPedido
                );
        }


        // ==========================================
        // ACTUALIZAR SUBPEDIDO
        // ==========================================

        public async Task ActualizarSubPedidoAsync(
            SubPedido subPedido)
        {
            _context.SubPedidos.Update(
                subPedido
            );

            await _context.SaveChangesAsync();
        }



        // ==========================================
        // OBTENER TODOS LOS PEDIDOS - ADMIN
        // ==========================================

        public async Task<List<Pedido>>
            ObtenerTodosLosPedidosAsync()
        {
            return await _context.Pedidos

                .Include(p =>
                    p.IdUsuarioNavigation)

                .Include(p =>
                    p.SubPedidos)
                    .ThenInclude(sp =>
                        sp.IdTiendaNavigation)

                .Include(p =>
                    p.SubPedidos)
                    .ThenInclude(sp =>
                        sp.Detalles)
                        .ThenInclude(d =>
                            d.IdProductoNavigation)

                .OrderByDescending(p =>
                    p.FechaPedido)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER INVENTARIO POR PRODUCTO
        // ==========================================

        public async Task<Inventario?>
            ObtenerInventarioPorProductoAsync(
                int idProducto)
        {
            return await _context.Inventarios
                .FirstOrDefaultAsync(
                    i => i.IdProducto == idProducto
                );
        }


        // ==========================================
        // ACTUALIZAR INVENTARIO
        // ==========================================

        public async Task ActualizarInventarioAsync(
            Inventario inventario)
        {
            _context.Inventarios.Update(
                inventario
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // REGISTRAR MOVIMIENTO DE INVENTARIO
        // ==========================================

        public async Task RegistrarMovimientoInventarioAsync(
            MovimientoInventario movimiento)
        {
            _context.MovimientosInventario.Add(
                movimiento
            );

            await _context.SaveChangesAsync();
        }

        // ==========================================
        // OBTENER DETALLE DE PRODUCTO EN SUBPEDIDO
        // ==========================================

        public async Task<DetalleSubPedido?>
            ObtenerDetalleSubPedidoAsync(
                int idSubPedido,
                int idProducto)
        {
            return await _context.DetalleSubPedidos
                .FirstOrDefaultAsync(d =>
                    d.IdSubPedido == idSubPedido &&
                    d.IdProducto == idProducto
                );
        }


        // ==========================================
        // OBTENER CANTIDAD DEVUELTA
        // ==========================================

        public async Task<int> ObtenerCantidadDevueltaAsync(
        int idSubPedido,
        int idProducto)
        {
            string referencia =
                $"SUBPEDIDO #{idSubPedido}";

            var inventario =
                await _context.Inventarios
                    .FirstOrDefaultAsync(i =>
                        i.IdProducto == idProducto
                    );

            if (inventario == null)
            {
                return 0;
            }

            return await _context.MovimientosInventario
                .Where(m =>
                    m.IdInventario == inventario.IdInventario &&
                    m.TipoMovimiento == "DEVOLUCION" &&
                    m.Referencia == referencia
                )
                .SumAsync(m => (int?)m.Cantidad)
                ?? 0;
        }

        // ==========================================
        // CREAR ENTREGA DE SUBPEDIDO
        // ==========================================

        public async Task CrearEntregaSubPedidoAsync(
            EntregaSubPedido entrega)
        {
            _context.EntregasSubPedido.Add(entrega);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // OBTENER ENTREGA POR SUBPEDIDO
        // ==========================================

        public async Task<EntregaSubPedido?>
            ObtenerEntregaPorSubPedidoAsync(
                int idSubPedido)
        {
            return await _context.EntregasSubPedido
                .Include(e => e.IdSubPedidoNavigation)
                .ThenInclude(sp => sp!.IdTiendaNavigation)
                .FirstOrDefaultAsync(e =>
                    e.IdSubPedido == idSubPedido);
        }


        // ==========================================
        // ACTUALIZAR ENTREGA
        // ==========================================

        public async Task ActualizarEntregaSubPedidoAsync(
            EntregaSubPedido entrega)
        {
            _context.EntregasSubPedido.Update(entrega);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // SINCRONIZAR ESTADO DEL SUBPEDIDO
        // ==========================================

        public async Task SincronizarEstadoSubPedidoAsync(
            int idSubPedido,
            string estadoEntrega)
        {
            var subPedido =
                await _context.SubPedidos
                    .FirstOrDefaultAsync(sp =>
                        sp.IdSubPedido == idSubPedido);

            if (subPedido == null)
            {
                return;
            }


            string nuevoEstadoSubPedido =
                estadoEntrega switch
                {
                    "PENDIENTE"
                        => "PENDIENTE",

                    "LISTO_PARA_ENVIO"
                        => "PREPARANDO",

                    "LISTO_PARA_RECOGER"
                        => "PREPARANDO",

                    "EN_CAMINO"
                        => "ENVIADO",

                    "ENTREGADO"
                        => "ENTREGADO",

                    "CANCELADO"
                        => "CANCELADO",

                    _ => subPedido.Estado
                };


            subPedido.Estado =
                nuevoEstadoSubPedido;

            subPedido.FechaActualizacion =
                DateTime.Now;


            await _context.SaveChangesAsync();
        }

        // ==========================================
        // SINCRONIZAR ESTADO DEL PEDIDO PRINCIPAL
        // ==========================================

        public async Task SincronizarEstadoPedidoAsync(
            int idPedido)
        {
            var pedido =
                await _context.Pedidos
                    .Include(p => p.SubPedidos)
                    .FirstOrDefaultAsync(p =>
                        p.IdPedido == idPedido);

            if (pedido == null ||
                pedido.SubPedidos == null ||
                !pedido.SubPedidos.Any())
            {
                return;
            }


            var estados =
                pedido.SubPedidos
                    .Select(sp =>
                        sp.Estado
                            .Trim()
                            .ToUpperInvariant())
                    .ToList();


            string nuevoEstado;


            // ==========================================
            // TODOS ENTREGADOS
            // ==========================================

            if (estados.All(e =>
                e == "ENTREGADO"))
            {
                nuevoEstado =
                    "ENTREGADO";
            }


            // ==========================================
            // TODOS CANCELADOS
            // ==========================================

            else if (estados.All(e =>
                e == "CANCELADO"))
            {
                nuevoEstado =
                    "CANCELADO";
            }


            // ==========================================
            // ALGUNO YA FUE ENVIADO O ENTREGADO
            // ==========================================

            else if (estados.Any(e =>
                e == "ENVIADO" ||
                e == "ENTREGADO"))
            {
                nuevoEstado =
                    "ENVIADO";
            }


            // ==========================================
            // ALGUNO ESTÁ EN PREPARACIÓN
            // ==========================================

            else if (estados.Any(e =>
                e == "PREPARANDO"))
            {
                nuevoEstado =
                    "PREPARANDO";
            }


            // ==========================================
            // ALGUNO FUE CONFIRMADO
            // ==========================================

            else if (estados.Any(e =>
                e == "CONFIRMADO"))
            {
                nuevoEstado =
                    "CONFIRMADO";
            }


            // ==========================================
            // TODAVÍA NO HA INICIADO
            // ==========================================

            else
            {
                nuevoEstado =
                    "PENDIENTE";
            }


            pedido.Estado =
                nuevoEstado;


            await _context.SaveChangesAsync();
        }

        // ==========================================
        // REGISTRAR HISTORIAL DE ENTREGA
        // ==========================================

        public async Task RegistrarHistorialEntregaAsync(
            HistorialEntrega historial)
        {
            _context.HistorialEntregas.Add(historial);

            await _context.SaveChangesAsync();
        }

        // ==========================================
        // OBTENER HISTORIAL DE UNA ENTREGA
        // ==========================================

        public async Task<List<HistorialEntrega>>
            ObtenerHistorialEntregaAsync(
                int idSubPedido)
        {
            return await _context.HistorialEntregas

                .Include(h =>
                    h.IdEntregaNavigation)

                .Where(h =>
                    h.IdEntregaNavigation != null &&
                    h.IdEntregaNavigation.IdSubPedido == idSubPedido)

                .OrderBy(h =>
                    h.FechaCambio)

                .ToListAsync();
        }

    }
}