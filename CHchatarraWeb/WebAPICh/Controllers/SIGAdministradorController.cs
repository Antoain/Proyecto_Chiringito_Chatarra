using ChiringuitoCH_Data.DAO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")]
    public class SIGAdministradorController : ControllerBase
    {
        private readonly SIGAdministradorDAO _sigAdministradorDAO;

        public SIGAdministradorController(
            SIGAdministradorDAO sigAdministradorDAO)
        {
            _sigAdministradorDAO = sigAdministradorDAO;
        }

        // ==========================================
        // RESUMEN DE TIENDAS
        // ==========================================

        [HttpGet("Tiendas")]
        public async Task<IActionResult> Tiendas()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenTiendasAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RESUMEN DE VENDEDORES
        // ==========================================

        [HttpGet("Vendedores")]
        public async Task<IActionResult> Vendedores()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenVendedoresAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RESUMEN DE CLIENTES
        // ==========================================

        [HttpGet("Clientes")]
        public async Task<IActionResult> Clientes()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenClientesAsync();

            return Ok(resultado);
        }

        // ==========================================
        // KPI CONVERSIÓN DE CLIENTES
        // ==========================================

        [HttpGet("ConversionClientes")]
        public async Task<IActionResult> ConversionClientes()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerConversionClientesAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RESUMEN GLOBAL DE PEDIDOS
        // ==========================================

        [HttpGet("Pedidos")]
        public async Task<IActionResult> Pedidos()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenPedidosAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RESUMEN GLOBAL DE VENTAS
        // ==========================================

        [HttpGet("Ventas")]
        public async Task<IActionResult> Ventas()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenVentasAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RESUMEN GLOBAL DE COMISIONES
        // ==========================================

        [HttpGet("Comisiones")]
        public async Task<IActionResult> Comisiones()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerResumenComisionesAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RENDIMIENTO GLOBAL DE LA PLATAFORMA
        // ==========================================

        [HttpGet("RendimientoPlataforma")]
        public async Task<IActionResult> RendimientoPlataforma()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerRendimientoPlataformaAsync();

            return Ok(resultado);
        }

        // ==========================================
        // CRECIMIENTO Y TENDENCIAS GLOBALES
        // ==========================================

        [HttpGet("TendenciasGlobales")]
        public async Task<IActionResult> TendenciasGlobales()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerTendenciasGlobalesAsync();

            return Ok(resultado);
        }

        // ==========================================
        // RENDIMIENTO AVANZADO DE TIENDAS
        // ==========================================

        [HttpGet("RendimientoTiendas")]
        public async Task<IActionResult> RendimientoTiendas()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerRendimientoTiendasAsync();

            return Ok(resultado);
        }

        // ==========================================
        // INDICADORES LOGÍSTICOS GLOBALES
        // ==========================================

        [HttpGet("KpisLogisticos")]
        public async Task<IActionResult> KpisLogisticos()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerKpisLogisticosGlobalesAsync();

            return Ok(resultado);
        }

        // ==========================================
        // TIEMPO PROMEDIO DE ENTREGA GLOBAL
        // ==========================================

        [HttpGet("TiempoPromedioEntrega")]
        public async Task<IActionResult> TiempoPromedioEntrega()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerTiempoPromedioEntregaGlobalAsync();

            return Ok(resultado);
        }

        // ==========================================
        // DASHBOARD ADMINISTRATIVO CONSOLIDADO
        // ==========================================

        [HttpGet("Dashboard")]
        public async Task<IActionResult> Dashboard()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerDashboardAsync();

            return Ok(resultado);
        }

        // ==========================================
        // IMPLEMENTACION DE MINERIA DE DATOS G.1 DATASET PARA MINERÍA DE DATOS
        // ==========================================

        [HttpGet("DatasetClientes")]
        public async Task<IActionResult> DatasetClientes()
        {
            var resultado =
                await _sigAdministradorDAO
                    .ObtenerDatasetClientesAsync();

            return Ok(resultado);
        }
    }

}