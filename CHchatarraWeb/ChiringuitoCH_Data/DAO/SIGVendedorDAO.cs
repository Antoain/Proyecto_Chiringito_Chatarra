using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class SIGVendedorDAO
    {
        private readonly ChChatarra40Context _context;

        public SIGVendedorDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER SUBPEDIDOS DEL VENDEDOR
        // ==========================================

        public async Task<List<SubPedido>>
            ObtenerSubPedidosVendedorAsync(
                int idVendedor)
        {
            return await _context.SubPedidos

                .Include(sp =>
                    sp.IdTiendaNavigation)

                .Where(sp =>
                    sp.IdTiendaNavigation != null &&
                    sp.IdTiendaNavigation.IdVendedor
                        == idVendedor)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER PRODUCTOS MÁS VENDIDOS
        // ==========================================

        public async Task<object> ObtenerProductosMasVendidosAsync(
            int idVendedor)
        {
            var productos =
                await _context.DetalleSubPedidos

                    .Include(d =>
                        d.IdSubPedidoNavigation)

                    .ThenInclude(sp =>
                        sp!.IdTiendaNavigation)

                    .Include(d =>
                        d.IdProductoNavigation)

                    .Where(d =>
                        d.IdSubPedidoNavigation != null &&
                        d.IdSubPedidoNavigation.IdTiendaNavigation != null &&
                        d.IdSubPedidoNavigation.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        d.IdSubPedidoNavigation.Estado != "CANCELADO")

                    .GroupBy(d => new
                    {
                        d.IdProducto,
                        Nombre =
                            d.IdProductoNavigation != null
                                ? d.IdProductoNavigation.Nombre
                                : "Producto no disponible"
                    })

                    .Select(g => new
                    {
                        IdProducto =
                            g.Key.IdProducto,

                        Nombre =
                            g.Key.Nombre,

                        CantidadVendida =
                            g.Sum(x => x.Cantidad),

                        TotalGenerado =
                            g.Sum(x => x.Subtotal)
                    })

                    .OrderByDescending(x =>
                        x.CantidadVendida)

                    .ToListAsync();

            return productos;
        }


        // ==========================================
        // OBTENER PRODUCTOS CON STOCK BAJO
        // ==========================================

        public async Task<object> ObtenerStockBajoAsync(
            int idVendedor)
        {
            var productos =
                await _context.Inventarios

                    .Include(i =>
                        i.IdProductoNavigation)

                    .ThenInclude(p =>
                        p!.IdTiendaNavigation)

                    .Where(i =>
                        i.IdProductoNavigation != null &&
                        i.IdProductoNavigation.IdTiendaNavigation != null &&
                        i.IdProductoNavigation.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        i.StockActual <= i.StockMinimo)

                    .Select(i => new
                    {
                        i.IdProducto,

                        Nombre =
                            i.IdProductoNavigation != null
                                ? i.IdProductoNavigation.Nombre
                                : "Producto no disponible",

                        StockActual =
                            i.StockActual,

                        StockMinimo =
                            i.StockMinimo
                    })

                    .OrderBy(i =>
                        i.StockActual)

                    .ToListAsync();

            return productos;
        }

        // ==========================================
        // OBTENER TENDENCIA DE VENTAS POR FECHA
        // ==========================================

        public async Task<object> ObtenerTendenciaVentasAsync(
            int idVendedor)
        {
            var tendencia =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdTiendaNavigation)

                    .Include(sp =>
                        sp.IdPedidoNavigation)

                    .Where(sp =>
                        sp.IdTiendaNavigation != null &&
                        sp.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        sp.Estado != "CANCELADO" &&
                        sp.IdPedidoNavigation != null)

                    .GroupBy(sp =>
                        sp.IdPedidoNavigation!.FechaPedido.Date)

                    .Select(g => new
                    {
                        Fecha =
                            g.Key,

                        TotalVentas =
                            g.Sum(sp =>
                                sp.Subtotal),

                        CantidadPedidos =
                            g.Count()
                    })

                    .OrderBy(x =>
                        x.Fecha)

                    .ToListAsync();

            return tendencia;
        }


        // ==========================================
        // OBTENER CLIENTES RECURRENTES
        // ==========================================

        public async Task<object> ObtenerClientesRecurrentesAsync(
            int idVendedor)
        {
            var clientes =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdTiendaNavigation)

                    .Include(sp =>
                        sp.IdPedidoNavigation)

                    .ThenInclude(p =>
                        p!.IdUsuarioNavigation)

                    .Where(sp =>
                        sp.IdTiendaNavigation != null &&
                        sp.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        sp.IdPedidoNavigation != null &&
                        sp.Estado != "CANCELADO")

                    .GroupBy(sp => new
                    {
                        IdUsuario =
                            sp.IdPedidoNavigation!.IdUsuario,

                        Nombres =
                            sp.IdPedidoNavigation.IdUsuarioNavigation != null
                                ? sp.IdPedidoNavigation.IdUsuarioNavigation.Nombres
                                : "",

                        Apellidos =
                            sp.IdPedidoNavigation.IdUsuarioNavigation != null
                                ? sp.IdPedidoNavigation.IdUsuarioNavigation.Apellidos
                                : "",

                        Correo =
                            sp.IdPedidoNavigation.IdUsuarioNavigation != null
                                ? sp.IdPedidoNavigation.IdUsuarioNavigation.Correo
                                : ""
                    })

                    .Select(g => new
                    {
                        IdUsuario =
                            g.Key.IdUsuario,

                        Nombres =
                            g.Key.Nombres,

                        Apellidos =
                            g.Key.Apellidos,

                        Correo =
                            g.Key.Correo,

                        CantidadPedidos =
                            g.Select(sp => sp.IdPedido)
                                .Distinct()
                                .Count(),

                        TotalComprado =
                            g.Sum(sp => sp.Subtotal)
                    })

                    .Where(c =>
                        c.CantidadPedidos >= 2)

                    .OrderByDescending(c =>
                        c.CantidadPedidos)

                    .ToListAsync();

            return clientes;
        }

        // ==========================================
        // OBTENER RENDIMIENTO DE PRODUCTOS
        // ==========================================

        public async Task<object> ObtenerRendimientoProductosAsync(
            int idVendedor)
        {
            var datos =
                await _context.DetalleSubPedidos

                    .Include(d =>
                        d.IdSubPedidoNavigation)

                    .ThenInclude(sp =>
                        sp!.IdTiendaNavigation)

                    .Include(d =>
                        d.IdProductoNavigation)

                    .Where(d =>
                        d.IdSubPedidoNavigation != null &&
                        d.IdSubPedidoNavigation.IdTiendaNavigation != null &&
                        d.IdSubPedidoNavigation.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        d.IdSubPedidoNavigation.Estado != "CANCELADO")

                    .GroupBy(d => new
                    {
                        d.IdProducto,

                        Nombre =
                            d.IdProductoNavigation != null
                                ? d.IdProductoNavigation.Nombre
                                : "Producto no disponible"
                    })

                    .Select(g => new
                    {
                        IdProducto =
                            g.Key.IdProducto,

                        Nombre =
                            g.Key.Nombre,

                        CantidadVendida =
                            g.Sum(x =>
                                x.Cantidad),

                        TotalGenerado =
                            g.Sum(x =>
                                x.Subtotal)
                    })

                    .OrderByDescending(x =>
                        x.TotalGenerado)

                    .ToListAsync();


            decimal totalGeneral =
                datos.Sum(x =>
                    x.TotalGenerado);


            var resultado =
                datos.Select(x => new
                {
                    x.IdProducto,

                    x.Nombre,

                    x.CantidadVendida,

                    TotalGenerado =
                        Math.Round(
                            x.TotalGenerado,
                            2
                        ),

                    ParticipacionPorcentaje =
                        totalGeneral > 0
                            ? Math.Round(
                                (x.TotalGenerado /
                                 totalGeneral) * 100,
                                2
                            )
                            : 0
                })
                .ToList();


            return resultado;
        }

        // ==========================================
        // OBTENER PEDIDOS POR ESTADO
        // ==========================================

        public async Task<object> ObtenerPedidosPorEstadoAsync(
            int idVendedor)
        {
            var pedidos =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdTiendaNavigation)

                    .Where(sp =>
                        sp.IdTiendaNavigation != null &&
                        sp.IdTiendaNavigation.IdVendedor
                            == idVendedor)

                    .GroupBy(sp =>
                        sp.Estado)

                    .Select(g => new
                    {
                        Estado =
                            g.Key,

                        CantidadPedidos =
                            g.Count(),

                        Total =
                            g.Sum(sp =>
                                sp.Subtotal)
                    })

                    .OrderByDescending(x =>
                        x.CantidadPedidos)

                    .ToListAsync();


            var resultado =
                pedidos.Select(x => new
                {
                    x.Estado,

                    x.CantidadPedidos,

                    Total =
                        Math.Round(
                            x.Total,
                            2
                        )
                })
                .ToList();


            return resultado;
        }

        // ==========================================
        // OBTENER MOVIMIENTOS DE INVENTARIO
        // ==========================================

        public async Task<object> ObtenerMovimientosInventarioAsync(
            int idVendedor)
        {
            var movimientos =
                await _context.MovimientosInventario

                    .Include(m =>
                        m.IdInventarioNavigation)

                    .ThenInclude(i =>
                        i!.IdProductoNavigation)

                    .ThenInclude(p =>
                        p!.IdTiendaNavigation)

                    .Where(m =>
                        m.IdInventarioNavigation != null &&
                        m.IdInventarioNavigation.IdProductoNavigation != null &&
                        m.IdInventarioNavigation.IdProductoNavigation.IdTiendaNavigation != null &&
                        m.IdInventarioNavigation.IdProductoNavigation
                            .IdTiendaNavigation.IdVendedor == idVendedor)

                    .GroupBy(m =>
                        m.TipoMovimiento)

                    .Select(g => new
                    {
                        TipoMovimiento =
                            g.Key,

                        CantidadMovimientos =
                            g.Count(),

                        UnidadesMovidas =
                            g.Sum(m =>
                                m.Cantidad)
                    })

                    .OrderByDescending(x =>
                        x.UnidadesMovidas)

                    .ToListAsync();

            return movimientos;
        }

        // ==========================================
        // OBTENER KPIs LOGÍSTICOS
        // ==========================================

        public async Task<object> ObtenerKpisLogisticosAsync(
            int idVendedor)
        {
            var entregas =
                await _context.EntregasSubPedido

                    .Include(e =>
                        e.IdSubPedidoNavigation)

                    .ThenInclude(sp =>
                        sp!.IdTiendaNavigation)

                    .Where(e =>
                        e.IdSubPedidoNavigation != null &&
                        e.IdSubPedidoNavigation.IdTiendaNavigation != null &&
                        e.IdSubPedidoNavigation.IdTiendaNavigation.IdVendedor
                            == idVendedor)

                    .ToListAsync();


            int totalEntregas =
                entregas.Count;

            int pendientes =
                entregas.Count(e =>
                    e.EstadoEntrega == "PENDIENTE");

            int listasParaEnvio =
                entregas.Count(e =>
                    e.EstadoEntrega == "LISTO_PARA_ENVIO");

            int listasParaRecoger =
                entregas.Count(e =>
                    e.EstadoEntrega == "LISTO_PARA_RECOGER");

            int enCamino =
                entregas.Count(e =>
                    e.EstadoEntrega == "EN_CAMINO");

            int entregadas =
                entregas.Count(e =>
                    e.EstadoEntrega == "ENTREGADO");

            int canceladas =
                entregas.Count(e =>
                    e.EstadoEntrega == "CANCELADO");


            decimal porcentajeCompletadas =
                totalEntregas > 0
                    ? Math.Round(
                        ((decimal)entregadas /
                         totalEntregas) * 100,
                        2)
                    : 0;


            return new
            {
                TotalEntregas =
                    totalEntregas,

                Pendientes =
                    pendientes,

                ListasParaEnvio =
                    listasParaEnvio,

                ListasParaRecoger =
                    listasParaRecoger,

                EnCamino =
                    enCamino,

                Entregadas =
                    entregadas,

                Canceladas =
                    canceladas,

                PorcentajeCompletadas =
                    porcentajeCompletadas
            };
        }

        // ==========================================
        // OBTENER TIEMPO PROMEDIO DE ENTREGA
        // ==========================================

        public async Task<object> ObtenerTiempoPromedioEntregaAsync(
            int idVendedor)
        {
            var entregas =
                await _context.EntregasSubPedido

                    .Include(e =>
                        e.IdSubPedidoNavigation)

                    .ThenInclude(sp =>
                        sp!.IdTiendaNavigation)

                    .Where(e =>
                        e.IdSubPedidoNavigation != null &&
                        e.IdSubPedidoNavigation.IdTiendaNavigation != null &&
                        e.IdSubPedidoNavigation.IdTiendaNavigation.IdVendedor
                            == idVendedor &&
                        e.EstadoEntrega == "ENTREGADO" &&
                        e.FechaEntrega != null)

                    .Select(e => new
                    {
                        e.FechaCreacion,
                        e.FechaEntrega
                    })

                    .ToListAsync();


            if (entregas.Count == 0)
            {
                return new
                {
                    EntregasCompletadas = 0,
                    TiempoPromedioHoras = 0,
                    TiempoPromedioDias = 0
                };
            }


            double totalHoras =
                entregas.Sum(e =>
                    (e.FechaEntrega!.Value -
                     e.FechaCreacion).TotalHours);


            double promedioHoras =
                totalHoras /
                entregas.Count;


            return new
            {
                EntregasCompletadas =
                    entregas.Count,

                TiempoPromedioHoras =
                    Math.Round(
                        promedioHoras,
                        2),

                TiempoPromedioDias =
                    Math.Round(
                        promedioHoras / 24,
                        2)
            };
        }

        // ==========================================
        // OBTENER DASHBOARD COMPLETO DEL VENDEDOR
        // ==========================================

        public async Task<object> ObtenerDashboardAsync(
            int idVendedor)
        {
            var subPedidos =
                await ObtenerSubPedidosVendedorAsync(
                    idVendedor);

            var subPedidosValidos =
                subPedidos
                    .Where(sp =>
                        sp.Estado != "CANCELADO")
                    .ToList();


            decimal totalVentas =
                subPedidosValidos.Sum(sp =>
                    sp.Subtotal);

            int totalPedidos =
                subPedidosValidos.Count;

            decimal ticketPromedio =
                totalPedidos > 0
                    ? totalVentas / totalPedidos
                    : 0;


            var productosMasVendidos =
                await ObtenerProductosMasVendidosAsync(
                    idVendedor);

            var stockBajo =
                await ObtenerStockBajoAsync(
                    idVendedor);

            var tendencias =
                await ObtenerTendenciaVentasAsync(
                    idVendedor);

            var clientesRecurrentes =
                await ObtenerClientesRecurrentesAsync(
                    idVendedor);

            var rendimientoProductos =
                await ObtenerRendimientoProductosAsync(
                    idVendedor);

            var pedidosPorEstado =
                await ObtenerPedidosPorEstadoAsync(
                    idVendedor);

            var movimientosInventario =
                await ObtenerMovimientosInventarioAsync(
                    idVendedor);

            var kpisLogisticos =
                await ObtenerKpisLogisticosAsync(
                    idVendedor);

            var tiempoPromedioEntrega =
                await ObtenerTiempoPromedioEntregaAsync(
                    idVendedor);


            return new
            {
                Resumen = new
                {
                    TotalVentas =
                        Math.Round(
                            totalVentas,
                            2),

                    TotalPedidos =
                        totalPedidos,

                    TicketPromedio =
                        Math.Round(
                            ticketPromedio,
                            2)
                },

                ProductosMasVendidos =
                    productosMasVendidos,

                StockBajo =
                    stockBajo,

                Tendencias =
                    tendencias,

                ClientesRecurrentes =
                    clientesRecurrentes,

                RendimientoProductos =
                    rendimientoProductos,

                PedidosPorEstado =
                    pedidosPorEstado,

                MovimientosInventario =
                    movimientosInventario,

                KpisLogisticos =
                    kpisLogisticos,

                TiempoPromedioEntrega =
                    tiempoPromedioEntrega
            };
        }
    }
}