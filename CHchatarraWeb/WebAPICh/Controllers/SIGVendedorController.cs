using ChiringuitoCH_Data.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Vendedor")]
    public class SIGVendedorController : ControllerBase
    {
        private readonly SIGVendedorDAO _sigVendedorDAO;

        public SIGVendedorController(
            SIGVendedorDAO sigVendedorDAO)
        {
            _sigVendedorDAO = sigVendedorDAO;
        }


        // ==========================================
        // RESUMEN GENERAL DEL VENDEDOR
        // ==========================================

        [HttpGet("Resumen")]
        public async Task<IActionResult> Resumen()
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
            // 2. OBTENER SUBPEDIDOS DEL VENDEDOR
            // ==========================================

            var subPedidos =
                await _sigVendedorDAO
                    .ObtenerSubPedidosVendedorAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. CONSIDERAR VENTAS VÁLIDAS
            // ==========================================

            var ventasValidas =
                subPedidos
                    .Where(sp =>
                        sp.Estado != "CANCELADO")
                    .ToList();


            // ==========================================
            // 4. CALCULAR TOTAL DE VENTAS
            // ==========================================

            decimal totalVentas =
                ventasValidas.Sum(sp =>
                    sp.Subtotal);


            // ==========================================
            // 5. CALCULAR TOTAL DE PEDIDOS
            // ==========================================

            int totalPedidos =
                ventasValidas.Count;


            // ==========================================
            // 6. CALCULAR TICKET PROMEDIO
            // ==========================================

            decimal ticketPromedio =
                totalPedidos > 0
                    ? totalVentas / totalPedidos
                    : 0;


            // ==========================================
            // 7. RESPUESTA
            // ==========================================

            return Ok(new
            {
                totalVentas =
                    Math.Round(totalVentas, 2),

                totalPedidos,

                ticketPromedio =
                    Math.Round(ticketPromedio, 2)
            });
        }


        // ==========================================
        // PRODUCTOS MÁS VENDIDOS
        // ==========================================

        [HttpGet("ProductosMasVendidos")]
        public async Task<IActionResult> ProductosMasVendidos()
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
            // 2. OBTENER PRODUCTOS MÁS VENDIDOS
            // ==========================================

            var productos =
                await _sigVendedorDAO
                    .ObtenerProductosMasVendidosAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(productos);
        }

        // ==========================================
        // PRODUCTOS CON STOCK BAJO
        // ==========================================

        [HttpGet("StockBajo")]
        public async Task<IActionResult> StockBajo()
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
            // 2. OBTENER PRODUCTOS CON STOCK BAJO
            // ==========================================

            var productos =
                await _sigVendedorDAO
                    .ObtenerStockBajoAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(productos);
        }

        // ==========================================
        // TENDENCIA DE VENTAS
        // ==========================================

        [HttpGet("Tendencias")]
        public async Task<IActionResult> Tendencias()
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
            // 2. OBTENER TENDENCIA DE VENTAS
            // ==========================================

            var tendencia =
                await _sigVendedorDAO
                    .ObtenerTendenciaVentasAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(tendencia);
        }

        // ==========================================
        // CLIENTES RECURRENTES
        // ==========================================

        [HttpGet("ClientesRecurrentes")]
        public async Task<IActionResult> ClientesRecurrentes()
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
            // 2. OBTENER CLIENTES RECURRENTES
            // ==========================================

            var clientes =
                await _sigVendedorDAO
                    .ObtenerClientesRecurrentesAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(clientes);
        }

        // ==========================================
        // RENDIMIENTO DE PRODUCTOS
        // ==========================================

        [HttpGet("RendimientoProductos")]
        public async Task<IActionResult> RendimientoProductos()
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
            // 2. OBTENER RENDIMIENTO DE PRODUCTOS
            // ==========================================

            var productos =
                await _sigVendedorDAO
                    .ObtenerRendimientoProductosAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(productos);
        }

        // ==========================================
        // PEDIDOS POR ESTADO
        // ==========================================

        [HttpGet("PedidosPorEstado")]
        public async Task<IActionResult> PedidosPorEstado()
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
            // 2. OBTENER PEDIDOS POR ESTADO
            // ==========================================

            var pedidos =
                await _sigVendedorDAO
                    .ObtenerPedidosPorEstadoAsync(
                        idVendedor
                    );


            // ==========================================
            // 3. RESPUESTA
            // ==========================================

            return Ok(pedidos);
        }

        // ==========================================
        // MOVIMIENTOS DE INVENTARIO
        // ==========================================

        [HttpGet("MovimientosInventario")]
        public async Task<IActionResult> MovimientosInventario()
        {
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

            var movimientos =
                await _sigVendedorDAO
                    .ObtenerMovimientosInventarioAsync(
                        idVendedor
                    );

            return Ok(movimientos);
        }

        // ==========================================
        // KPIs LOGÍSTICOS
        // ==========================================

        [HttpGet("KpisLogisticos")]
        public async Task<IActionResult> KpisLogisticos()
        {
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


            var kpis =
                await _sigVendedorDAO
                    .ObtenerKpisLogisticosAsync(
                        idVendedor
                    );


            return Ok(kpis);
        }

        // ==========================================
        // TIEMPO PROMEDIO DE ENTREGA
        // ==========================================

        [HttpGet("TiempoPromedioEntrega")]
        public async Task<IActionResult> TiempoPromedioEntrega()
        {
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


            var resultado =
                await _sigVendedorDAO
                    .ObtenerTiempoPromedioEntregaAsync(
                        idVendedor
                    );


            return Ok(resultado);
        }

        // ==========================================
        // DASHBOARD COMPLETO DEL VENDEDOR
        // ==========================================

        [HttpGet("Dashboard")]
        public async Task<IActionResult> Dashboard()
        {
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


            var dashboard =
                await _sigVendedorDAO
                    .ObtenerDashboardAsync(
                        idVendedor);


            return Ok(dashboard);
        }
    }
}