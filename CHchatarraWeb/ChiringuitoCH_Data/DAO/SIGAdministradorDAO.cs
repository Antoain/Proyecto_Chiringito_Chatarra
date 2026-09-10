using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class SIGAdministradorDAO
    {
        private readonly ChChatarra40Context _context;

        public SIGAdministradorDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }

        // ==========================================
        // RESUMEN DE TIENDAS
        // ==========================================

        public async Task<object> ObtenerResumenTiendasAsync()
        {
            var totalTiendas =
                await _context.Tiendas.CountAsync();

            var totalProductos =
                await _context.Productos.CountAsync();

            var ventasPorTienda =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdTiendaNavigation)

                    .Where(sp =>
                        sp.Estado != "CANCELADO")

                    .GroupBy(sp => new
                    {
                        sp.IdTienda,

                        NombreTienda =
                            sp.IdTiendaNavigation != null
                                ? sp.IdTiendaNavigation.NombreNegocio
                                : "Tienda no disponible"
                    })

                    .Select(g => new
                    {
                        IdTienda =
                            g.Key.IdTienda,

                        NombreTienda =
                            g.Key.NombreTienda,

                        CantidadPedidos =
                            g.Count(),

                        TotalVentas =
                            g.Sum(sp =>
                                sp.Subtotal)
                    })

                    .OrderByDescending(x =>
                        x.TotalVentas)

                    .ToListAsync();


            return new
            {
                TotalTiendas =
                    totalTiendas,

                TotalProductos =
                    totalProductos,

                RendimientoTiendas =
                    ventasPorTienda
            };
        }

        // ==========================================
        // RESUMEN DE VENDEDORES
        // ==========================================

        public async Task<object> ObtenerResumenVendedoresAsync()
        {
            var totalVendedores =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Vendedor");


            var rendimientoVendedores =
                await _context.Usuarios

                    .Where(u =>
                        u.Rol == "Vendedor")

                    .Select(u => new
                    {
                        IdVendedor =
                            u.IdUsuario,

                        Nombres =
                            u.Nombres,

                        Apellidos =
                            u.Apellidos,

                        Correo =
                            u.Correo,

                        CantidadTiendas =
                            _context.Tiendas.Count(t =>
                                t.IdVendedor == u.IdUsuario),

                        CantidadPedidos =
                            _context.SubPedidos.Count(sp =>
                                sp.IdTiendaNavigation != null &&
                                sp.IdTiendaNavigation.IdVendedor == u.IdUsuario &&
                                sp.Estado != "CANCELADO"),

                        TotalVentas =
                            _context.SubPedidos
                                .Where(sp =>
                                    sp.IdTiendaNavigation != null &&
                                    sp.IdTiendaNavigation.IdVendedor == u.IdUsuario &&
                                    sp.Estado != "CANCELADO")
                                .Sum(sp =>
                                    (decimal?)sp.Subtotal) ?? 0
                    })

                    .OrderByDescending(v =>
                        v.TotalVentas)

                    .ToListAsync();


            return new
            {
                TotalVendedores =
                    totalVendedores,

                RendimientoVendedores =
                    rendimientoVendedores
            };
        }

        // ==========================================
        // RESUMEN DE CLIENTES
        // ==========================================

        public async Task<object> ObtenerResumenClientesAsync()
        {
            var totalClientes =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Cliente");


            var clientes =
                await _context.Usuarios

                    .Where(u =>
                        u.Rol == "Cliente")

                    .Select(u => new
                    {
                        IdCliente =
                            u.IdUsuario,

                        Nombres =
                            u.Nombres,

                        Apellidos =
                            u.Apellidos,

                        Correo =
                            u.Correo,

                        CantidadPedidos =
                            _context.Pedidos.Count(p =>
                                p.IdUsuario == u.IdUsuario &&
                                p.Estado != "CANCELADO"),

                        TotalGastado =
                            _context.Pedidos
                                .Where(p =>
                                    p.IdUsuario == u.IdUsuario &&
                                    p.Estado != "CANCELADO")
                                .Sum(p =>
                                    (decimal?)p.Total) ?? 0
                    })

                    .OrderByDescending(c =>
                        c.TotalGastado)

                    .ToListAsync();


            var resultado =
                clientes.Select(c => new
                {
                    c.IdCliente,

                    c.Nombres,

                    c.Apellidos,

                    c.Correo,

                    c.CantidadPedidos,

                    TotalGastado =
                        Math.Round(
                            c.TotalGastado,
                            2),

                    TicketPromedio =
                        c.CantidadPedidos > 0
                            ? Math.Round(
                                c.TotalGastado /
                                c.CantidadPedidos,
                                2)
                            : 0
                })
                .ToList();


            int clientesConCompras =
                resultado.Count(c =>
                    c.CantidadPedidos > 0);

            int clientesSinCompras =
                totalClientes -
                clientesConCompras;


            return new
            {
                TotalClientes =
                    totalClientes,

                ClientesConCompras =
                    clientesConCompras,

                ClientesSinCompras =
                    clientesSinCompras,

                Clientes =
                    resultado
            };
        }

        // ==========================================
        // KPI CONVERSIÓN DE CLIENTES
        // ==========================================

        public async Task<object> ObtenerConversionClientesAsync()
        {
            int totalClientes =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Cliente");

            int clientesConCompras =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Cliente" &&
                        _context.Pedidos.Any(p =>
                            p.IdUsuario == u.IdUsuario &&
                            p.Estado != "CANCELADO"));

            decimal tasaConversion =
                totalClientes > 0
                    ? Math.Round(
                        ((decimal)clientesConCompras /
                         totalClientes) * 100,
                        2)
                    : 0;

            return new
            {
                TotalClientes =
                    totalClientes,

                ClientesConCompras =
                    clientesConCompras,

                ClientesSinCompras =
                    totalClientes - clientesConCompras,

                TasaConversion =
                    tasaConversion
            };
        }

        // ==========================================
        // RESUMEN GLOBAL DE PEDIDOS
        // ==========================================

        public async Task<object> ObtenerResumenPedidosAsync()
        {
            var pedidos =
                await _context.Pedidos
                    .ToListAsync();

            int totalPedidos =
                pedidos.Count;

            int pedidosCancelados =
                pedidos.Count(p =>
                    p.Estado == "CANCELADO");

            int pedidosActivos =
                totalPedidos -
                pedidosCancelados;

            decimal porcentajeCancelacion =
                totalPedidos > 0
                    ? Math.Round(
                        ((decimal)pedidosCancelados /
                         totalPedidos) * 100,
                        2)
                    : 0;


            var pedidosPorEstado =
                pedidos
                    .GroupBy(p =>
                        p.Estado)

                    .Select(g => new
                    {
                        Estado =
                            g.Key,

                        CantidadPedidos =
                            g.Count(),

                        Total =
                            Math.Round(
                                g.Sum(p => p.Total),
                                2)
                    })

                    .OrderByDescending(x =>
                        x.CantidadPedidos)

                    .ToList();


            return new
            {
                TotalPedidos =
                    totalPedidos,

                PedidosActivos =
                    pedidosActivos,

                PedidosCancelados =
                    pedidosCancelados,

                PorcentajeCancelacion =
                    porcentajeCancelacion,

                PedidosPorEstado =
                    pedidosPorEstado
            };
        }

        // ==========================================
        // RESUMEN GLOBAL DE VENTAS
        // ==========================================

        public async Task<object> ObtenerResumenVentasAsync()
        {
            var ventas =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdPedidoNavigation)

                    .Where(sp =>
                        sp.Estado != "CANCELADO" &&
                        sp.IdPedidoNavigation != null)

                    .ToListAsync();


            decimal totalVentas =
                ventas.Sum(sp =>
                    sp.Subtotal);

            int cantidadVentas =
                ventas.Count;

            decimal ticketPromedio =
                cantidadVentas > 0
                    ? totalVentas / cantidadVentas
                    : 0;


            var tendencia =
                ventas

                    .GroupBy(sp =>
                        sp.IdPedidoNavigation!
                            .FechaPedido.Date)

                    .Select(g => new
                    {
                        Fecha =
                            g.Key,

                        TotalVentas =
                            Math.Round(
                                g.Sum(sp =>
                                    sp.Subtotal),
                                2),

                        CantidadVentas =
                            g.Count()
                    })

                    .OrderBy(x =>
                        x.Fecha)

                    .ToList();


            return new
            {
                TotalVentas =
                    Math.Round(
                        totalVentas,
                        2),

                CantidadVentas =
                    cantidadVentas,

                TicketPromedio =
                    Math.Round(
                        ticketPromedio,
                        2),

                TendenciaVentas =
                    tendencia
            };
        }

        // ==========================================
        // RESUMEN GLOBAL DE COMISIONES
        // ==========================================

        public async Task<object> ObtenerResumenComisionesAsync()
        {
            var subPedidos =
                await _context.SubPedidos

                    .Include(sp =>
                        sp.IdTiendaNavigation)

                    .Where(sp =>
                        sp.Estado != "CANCELADO")

                    .ToListAsync();


            decimal totalComisiones =
                subPedidos.Sum(sp =>
                    sp.ComisionPlataforma);

            int cantidadSubPedidos =
                subPedidos.Count;

            decimal comisionPromedio =
                cantidadSubPedidos > 0
                    ? totalComisiones /
                      cantidadSubPedidos
                    : 0;


            var comisionesPorTienda =
                subPedidos

                    .GroupBy(sp => new
                    {
                        sp.IdTienda,

                        NombreTienda =
                            sp.IdTiendaNavigation != null
                                ? sp.IdTiendaNavigation.NombreNegocio
                                : "Tienda no disponible"
                    })

                    .Select(g => new
                    {
                        IdTienda =
                            g.Key.IdTienda,

                        NombreTienda =
                            g.Key.NombreTienda,

                        CantidadPedidos =
                            g.Count(),

                        TotalVentas =
                            Math.Round(
                                g.Sum(sp =>
                                    sp.Subtotal),
                                2),

                        TotalComisiones =
                            Math.Round(
                                g.Sum(sp =>
                                    sp.ComisionPlataforma),
                                2)
                    })

                    .OrderByDescending(x =>
                        x.TotalComisiones)

                    .ToList();


            return new
            {
                TotalComisiones =
                    Math.Round(
                        totalComisiones,
                        2),

                CantidadSubPedidos =
                    cantidadSubPedidos,

                ComisionPromedio =
                    Math.Round(
                        comisionPromedio,
                        2),

                ComisionesPorTienda =
                    comisionesPorTienda
            };
        }

        // ==========================================
        // RENDIMIENTO GLOBAL DE LA PLATAFORMA
        // ==========================================

        public async Task<object> ObtenerRendimientoPlataformaAsync()
        {
            // ==========================================
            // USUARIOS
            // ==========================================

            int totalClientes =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Cliente");

            int totalVendedores =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Vendedor");

            int totalTiendas =
                await _context.Tiendas
                    .CountAsync();


            // ==========================================
            // CLIENTES CON COMPRAS
            // ==========================================

            int clientesConCompras =
                await _context.Usuarios
                    .CountAsync(u =>
                        u.Rol == "Cliente" &&
                        _context.Pedidos.Any(p =>
                            p.IdUsuario == u.IdUsuario &&
                            p.Estado != "CANCELADO"));


            decimal tasaConversion =
                totalClientes > 0
                    ? Math.Round(
                        ((decimal)clientesConCompras /
                         totalClientes) * 100,
                        2)
                    : 0;


            // ==========================================
            // PEDIDOS PRINCIPALES
            // ==========================================

            int totalPedidos =
                await _context.Pedidos
                    .CountAsync();

            int pedidosCancelados =
                await _context.Pedidos
                    .CountAsync(p =>
                        p.Estado == "CANCELADO");

            int pedidosValidos =
                totalPedidos -
                pedidosCancelados;


            decimal porcentajeCancelacion =
                totalPedidos > 0
                    ? Math.Round(
                        ((decimal)pedidosCancelados /
                         totalPedidos) * 100,
                        2)
                    : 0;


            // ==========================================
            // VENTAS Y COMISIONES
            // ==========================================

            var subPedidosValidos =
                await _context.SubPedidos
                    .Where(sp =>
                        sp.Estado != "CANCELADO")
                    .ToListAsync();


            decimal totalVentas =
                subPedidosValidos.Sum(sp =>
                    sp.Subtotal);

            decimal totalComisiones =
                subPedidosValidos.Sum(sp =>
                    sp.ComisionPlataforma);

            decimal totalParaVendedores =
                subPedidosValidos.Sum(sp =>
                    sp.TotalVendedor);

            int cantidadVentas =
                subPedidosValidos.Count;


            decimal ticketPromedio =
                cantidadVentas > 0
                    ? totalVentas /
                      cantidadVentas
                    : 0;


            // ==========================================
            // RESPUESTA
            // ==========================================

            return new
            {
                Usuarios = new
                {
                    TotalClientes =
                        totalClientes,

                    ClientesConCompras =
                        clientesConCompras,

                    TotalVendedores =
                        totalVendedores,

                    TotalTiendas =
                        totalTiendas,

                    TasaConversionClientes =
                        tasaConversion
                },


                Pedidos = new
                {
                    TotalPedidos =
                        totalPedidos,

                    PedidosValidos =
                        pedidosValidos,

                    PedidosCancelados =
                        pedidosCancelados,

                    PorcentajeCancelacion =
                        porcentajeCancelacion
                },


                Ventas = new
                {
                    CantidadVentas =
                        cantidadVentas,

                    TotalVentas =
                        Math.Round(
                            totalVentas, 2),

                    TicketPromedio =
                        Math.Round(
                            ticketPromedio, 2)
                },


                Finanzas = new
                {
                    ComisionesPlataforma =
                        Math.Round(
                            totalComisiones, 2),

                    TotalParaVendedores =
                        Math.Round(
                            totalParaVendedores, 2)
                }
            };
        }

        // ==========================================
        // CRECIMIENTO Y TENDENCIAS GLOBALES
        // ==========================================

        public async Task<object> ObtenerTendenciasGlobalesAsync()
        {
            var subPedidos =
                await _context.SubPedidos
                    .Include(sp => sp.IdPedidoNavigation)
                    .Where(sp =>
                        sp.Estado != "CANCELADO" &&
                        sp.IdPedidoNavigation != null)
                    .ToListAsync();


            var tendencias =
                subPedidos
                    .GroupBy(sp =>
                        sp.IdPedidoNavigation!.FechaPedido.Date)
                    .Select(g => new
                    {
                        Fecha =
                            g.Key,

                        CantidadVentas =
                            g.Count(),

                        CantidadPedidos =
                            g.Select(sp => sp.IdPedido)
                                .Distinct()
                                .Count(),

                        TotalVentas =
                            Math.Round(
                                g.Sum(sp => sp.Subtotal),
                                2),

                        TotalComisiones =
                            Math.Round(
                                g.Sum(sp => sp.ComisionPlataforma),
                                2),

                        TotalVendedores =
                            Math.Round(
                                g.Sum(sp => sp.TotalVendedor),
                                2)
                    })
                    .OrderBy(x => x.Fecha)
                    .ToList();


            return new
            {
                TotalPeriodos =
                    tendencias.Count,

                Tendencias =
                    tendencias
            };
        }

        // ==========================================
        // RENDIMIENTO AVANZADO DE TIENDAS
        // ==========================================

        public async Task<object> ObtenerRendimientoTiendasAsync()
        {
            var subPedidos =
                await _context.SubPedidos
                    .Include(sp => sp.IdTiendaNavigation)
                    .Where(sp =>
                        sp.Estado != "CANCELADO")
                    .ToListAsync();


            var rendimiento =
                subPedidos
                    .GroupBy(sp => new
                    {
                        sp.IdTienda,
                        NombreTienda =
                            sp.IdTiendaNavigation != null
                                ? sp.IdTiendaNavigation.NombreNegocio
                                : "Tienda no disponible"
                    })
                    .Select(g => new
                    {
                        IdTienda =
                            g.Key.IdTienda,

                        NombreTienda =
                            g.Key.NombreTienda,

                        CantidadPedidos =
                            g.Count(),

                        TotalVentas =
                            Math.Round(
                                g.Sum(sp => sp.Subtotal),
                                2),

                        TotalComisiones =
                            Math.Round(
                                g.Sum(sp => sp.ComisionPlataforma),
                                2),

                        TotalVendedor =
                            Math.Round(
                                g.Sum(sp => sp.TotalVendedor),
                                2),

                        TicketPromedio =
                            Math.Round(
                                g.Average(sp => sp.Subtotal),
                                2)
                    })
                    .OrderByDescending(x =>
                        x.TotalVentas)
                    .ToList();


            return new
            {
                TotalTiendasConVentas =
                    rendimiento.Count,

                RendimientoTiendas =
                    rendimiento
            };
        }

        // ==========================================
        // INDICADORES LOGÍSTICOS GLOBALES
        // ==========================================

        public async Task<object> ObtenerKpisLogisticosGlobalesAsync()
        {
            var subPedidos =
                await _context.SubPedidos
                    .Include(sp => sp.EntregaSubPedido)
                    .Where(sp =>
                        sp.EntregaSubPedido != null)
                    .ToListAsync();


            var entregas =
                subPedidos
                    .Select(sp => sp.EntregaSubPedido!)
                    .ToList();


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


            decimal porcentajeCanceladas =
                totalEntregas > 0
                    ? Math.Round(
                        ((decimal)canceladas /
                         totalEntregas) * 100,
                        2)
                    : 0;


            // ==========================================
            // MÉTODOS DE ENTREGA
            // ==========================================

            var metodosEntrega =
                entregas
                    .GroupBy(e => e.MetodoEntrega)
                    .Select(g => new
                    {
                        Metodo =
                            g.Key,

                        Cantidad =
                            g.Count(),

                        Porcentaje =
                            totalEntregas > 0
                                ? Math.Round(
                                    ((decimal)g.Count() /
                                     totalEntregas) * 100,
                                    2)
                                : 0
                    })
                    .OrderByDescending(x =>
                        x.Cantidad)
                    .ToList();


            return new
            {
                TotalEntregas =
                    totalEntregas,

                Estados = new
                {
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
                        canceladas
                },

                Indicadores = new
                {
                    PorcentajeCompletadas =
                        porcentajeCompletadas,

                    PorcentajeCanceladas =
                        porcentajeCanceladas
                },

                MetodosEntrega =
                    metodosEntrega
            };
        }

        // ==========================================
        // TIEMPO PROMEDIO DE ENTREGA GLOBAL
        // ==========================================

        public async Task<object> ObtenerTiempoPromedioEntregaGlobalAsync()
        {
            var entregasCompletadas =
                await _context.EntregasSubPedido
                    .Where(e =>
                        e.EstadoEntrega == "ENTREGADO" &&
                        e.FechaEntrega != null)
                    .ToListAsync();


            int totalEntregasCompletadas =
                entregasCompletadas.Count;


            double promedioHoras =
                totalEntregasCompletadas > 0
                    ? entregasCompletadas
                        .Average(e =>
                            (e.FechaEntrega!.Value -
                             e.FechaCreacion)
                            .TotalHours)
                    : 0;


            double promedioDias =
                promedioHoras / 24;


            var porMetodo =
                entregasCompletadas
                    .GroupBy(e =>
                        e.MetodoEntrega)
                    .Select(g => new
                    {
                        Metodo =
                            g.Key,

                        EntregasCompletadas =
                            g.Count(),

                        TiempoPromedioHoras =
                            Math.Round(
                                g.Average(e =>
                                    (e.FechaEntrega!.Value -
                                     e.FechaCreacion)
                                    .TotalHours),
                                2),

                        TiempoPromedioDias =
                            Math.Round(
                                g.Average(e =>
                                    (e.FechaEntrega!.Value -
                                     e.FechaCreacion)
                                    .TotalDays),
                                2)
                    })
                    .OrderBy(x =>
                        x.TiempoPromedioHoras)
                    .ToList();


            return new
            {
                EntregasCompletadas =
                    totalEntregasCompletadas,

                TiempoPromedioHoras =
                    Math.Round(
                        promedioHoras,
                        2),

                TiempoPromedioDias =
                    Math.Round(
                        promedioDias,
                        2),

                TiempoPromedioPorMetodo =
                    porMetodo
            };
        }

        // ==========================================
        // DASHBOARD ADMINISTRATIVO CONSOLIDADO
        // ==========================================


        public async Task<object> ObtenerDashboardAsync()
        {
            var rendimientoPlataforma =
                await ObtenerRendimientoPlataformaAsync();

            var tendenciasGlobales =
                await ObtenerTendenciasGlobalesAsync();

            var rendimientoTiendas =
                await ObtenerRendimientoTiendasAsync();

            var kpisLogisticos =
                await ObtenerKpisLogisticosGlobalesAsync();

            var tiempoPromedioEntrega =
                await ObtenerTiempoPromedioEntregaGlobalAsync();


            return new
            {
                RendimientoPlataforma =
                    rendimientoPlataforma,

                TendenciasGlobales =
                    tendenciasGlobales,

                RendimientoTiendas =
                    rendimientoTiendas,

                KpisLogisticos =
                    kpisLogisticos,

                TiempoPromedioEntrega =
                    tiempoPromedioEntrega
            };
        }

        // ==========================================
        // IMPLEMENTACION DE MINERIA DE DATOS G.1 DATASET DE CLIENTES PARA MINERÍA
        // ==========================================

        public async Task<object> ObtenerDatasetClientesAsync()
        {
            var clientes =
                await _context.Usuarios
                    .Where(u => u.Rol == "Cliente")
                    .ToListAsync();


            // ==========================================
            // PEDIDOS
            // Traemos todos para analizar cancelaciones
            // ==========================================

            var todosLosPedidos =
                await _context.Pedidos
                    .ToListAsync();


            // ==========================================
            // SUBPEDIDOS
            // ==========================================

            var subPedidos =
                await _context.SubPedidos
                    .Where(sp => sp.Estado != "CANCELADO")
                    .ToListAsync();


            // ==========================================
            // DETALLES
            // ==========================================

            var detalles =
                await _context.DetalleSubPedidos
                    .ToListAsync();


            // ==========================================
            // PRODUCTOS
            // Necesarios para conocer categoría favorita
            // ==========================================

            var productos =
                await _context.Productos
                    .ToListAsync();


            // ==========================================
            // CONSTRUCCIÓN DEL DATASET
            // ==========================================

            var dataset = clientes
                .Select(cliente =>
                {
                    // ======================================
                    // PEDIDOS DEL CLIENTE
                    // ======================================

                    var todosPedidosCliente =
                        todosLosPedidos
                            .Where(p =>
                                p.IdUsuario == cliente.IdUsuario)
                            .ToList();


                    var pedidosCliente =
                        todosPedidosCliente
                            .Where(p =>
                                p.Estado != "CANCELADO")
                            .OrderBy(p =>
                                p.FechaPedido)
                            .ToList();


                    var pedidosCanceladosCliente =
                        todosPedidosCliente
                            .Where(p =>
                                p.Estado == "CANCELADO")
                            .ToList();


                    // ======================================
                    // SUBPEDIDOS DEL CLIENTE
                    // ======================================

                    var idsPedidosCliente =
                        pedidosCliente
                            .Select(p =>
                                p.IdPedido)
                            .ToHashSet();


                    var subPedidosCliente =
                        subPedidos
                            .Where(sp =>
                                idsPedidosCliente.Contains(
                                    sp.IdPedido))
                            .ToList();


                    // ======================================
                    // DETALLES DEL CLIENTE
                    // ======================================

                    var idsSubPedidosCliente =
                        subPedidosCliente
                            .Select(sp =>
                                sp.IdSubPedido)
                            .ToHashSet();


                    var detallesCliente =
                        detalles
                            .Where(d =>
                                idsSubPedidosCliente.Contains(
                                    d.IdSubPedido))
                            .ToList();


                    // ======================================
                    // CANTIDADES DE PEDIDOS
                    // ======================================

                    int cantidadPedidos =
                        pedidosCliente.Count;


                    int cantidadSubPedidos =
                        subPedidosCliente.Count;


                    int cantidadPedidosCancelados =
                        pedidosCanceladosCliente.Count;


                    int cantidadPedidosTotales =
                        todosPedidosCliente.Count;


                    // ======================================
                    // CANCELACIONES
                    // ======================================

                    decimal porcentajeCancelacion =
                        cantidadPedidosTotales > 0
                            ? Math.Round(
                                ((decimal)cantidadPedidosCancelados /
                                 cantidadPedidosTotales) * 100,
                                2)
                            : 0;


                    // ======================================
                    // GASTO DEL CLIENTE
                    // ======================================

                    decimal totalGastado =
                        pedidosCliente.Sum(p =>
                            p.Total);


                    decimal ticketPromedio =
                        cantidadPedidos > 0
                            ? totalGastado /
                              cantidadPedidos
                            : 0;


                    // ======================================
                    // PRODUCTOS COMPRADOS
                    // ======================================

                    int cantidadProductosComprados =
                        detallesCliente.Sum(d =>
                            d.Cantidad);


                    // ======================================
                    // TIENDAS DIFERENTES
                    // ======================================

                    int cantidadTiendasDiferentes =
                        subPedidosCliente
                            .Select(sp =>
                                sp.IdTienda)
                            .Distinct()
                            .Count();


                    // ======================================
                    // PRIMERA COMPRA
                    // ======================================

                    DateTime? fechaPrimeraCompra =
                        pedidosCliente.Any()
                            ? pedidosCliente
                                .Min(p =>
                                    p.FechaPedido)
                            : null;


                    // ======================================
                    // ÚLTIMA COMPRA
                    // ======================================

                    DateTime? fechaUltimaCompra =
                        pedidosCliente.Any()
                            ? pedidosCliente
                                .Max(p =>
                                    p.FechaPedido)
                            : null;


                    // ======================================
                    // ANTIGÜEDAD COMO CLIENTE
                    // ======================================

                    int? antiguedadClienteDias =
                        fechaPrimeraCompra.HasValue
                            ? (DateTime.Now.Date -
                               fechaPrimeraCompra.Value.Date)
                              .Days
                            : null;


                    // ======================================
                    // DÍAS DESDE ÚLTIMA COMPRA
                    // ======================================

                    int? diasDesdeUltimaCompra =
                        fechaUltimaCompra.HasValue
                            ? (DateTime.Now.Date -
                               fechaUltimaCompra.Value.Date)
                              .Days
                            : null;


                    // ======================================
                    // FRECUENCIA DE COMPRA
                    //
                    // Ejemplo:
                    // primera compra = día 1
                    // última compra = día 10
                    // 4 pedidos
                    //
                    // 9 días / 3 intervalos = cada 3 días
                    // ======================================

                    double? frecuenciaCompraDias = null;

                    if (cantidadPedidos >= 2 &&
                        fechaPrimeraCompra.HasValue &&
                        fechaUltimaCompra.HasValue)
                    {
                        double diasEntreCompras =
                            (fechaUltimaCompra.Value -
                             fechaPrimeraCompra.Value)
                            .TotalDays;


                        frecuenciaCompraDias =
                            Math.Round(
                                diasEntreCompras /
                                (cantidadPedidos - 1),
                                2);
                    }


                    // ======================================
                    // CATEGORÍA FAVORITA
                    //
                    // Se determina por la cantidad total
                    // de unidades compradas de cada categoría.
                    // ======================================

                    int? idCategoriaFavorita = null;


                    var categoriasCompradas =
                        detallesCliente
                            .Join(
                                productos,
                                detalle =>
                                    detalle.IdProducto,
                                producto =>
                                    producto.IdProducto,
                                (detalle, producto) =>
                                    new
                                    {
                                        producto.IdCategoria,
                                        detalle.Cantidad
                                    })
                            .GroupBy(x =>
                                x.IdCategoria)
                            .Select(g =>
                                new
                                {
                                    IdCategoria =
                                        g.Key,

                                    CantidadComprada =
                                        g.Sum(x =>
                                            x.Cantidad)
                                })
                            .OrderByDescending(x =>
                                x.CantidadComprada)
                            .FirstOrDefault();


                    if (categoriasCompradas != null)
                    {
                        idCategoriaFavorita =
                            categoriasCompradas.IdCategoria;
                    }


                    // ======================================
                    // MÉTODO DE ENTREGA MÁS UTILIZADO
                    // ======================================

                    string? metodoEntregaMasUsado =
                        subPedidosCliente
                            .Where(sp =>
                                !string.IsNullOrEmpty(
                                    sp.MetodoEntrega))
                            .GroupBy(sp =>
                                sp.MetodoEntrega)
                            .Select(g =>
                                new
                                {
                                    Metodo =
                                        g.Key,

                                    Cantidad =
                                        g.Count()
                                })
                            .OrderByDescending(x =>
                                x.Cantidad)
                            .Select(x =>
                                x.Metodo)
                            .FirstOrDefault();


                    // ======================================
                    // TARGET INICIAL
                    //
                    // 1 = cliente recurrente
                    // 0 = cliente no recurrente
                    // ======================================

                    int clienteRecurrente =
                        cantidadPedidos >= 2
                            ? 1
                            : 0;


                    // ======================================
                    // RESULTADO
                    // ======================================

                    return new
                    {
                        IdCliente =
                            cliente.IdUsuario,

                        CantidadPedidos =
                            cantidadPedidos,

                        CantidadSubPedidos =
                            cantidadSubPedidos,

                        TotalGastado =
                            Math.Round(
                                totalGastado,
                                2),

                        TicketPromedio =
                            Math.Round(
                                ticketPromedio,
                                2),

                        CantidadProductosComprados =
                            cantidadProductosComprados,

                        CantidadTiendasDiferentes =
                            cantidadTiendasDiferentes,

                        CantidadPedidosCancelados =
                            cantidadPedidosCancelados,

                        PorcentajeCancelacion =
                            porcentajeCancelacion,

                        FechaPrimeraCompra =
                            fechaPrimeraCompra,

                        AntiguedadClienteDias =
                            antiguedadClienteDias,

                        DiasDesdeUltimaCompra =
                            diasDesdeUltimaCompra,

                        FrecuenciaCompraDias =
                            frecuenciaCompraDias,

                        IdCategoriaFavorita =
                            idCategoriaFavorita,

                        MetodoEntregaMasUsado =
                            metodoEntregaMasUsado,

                        ClienteRecurrente =
                            clienteRecurrente
                    };
                })
                .OrderByDescending(x =>
                    x.TotalGastado)
                .ToList();


            // ==========================================
            // RESULTADO FINAL
            // ==========================================

            return new
            {
                TotalClientes =
                    dataset.Count,

                Dataset =
                    dataset
            };
        }
    }
}