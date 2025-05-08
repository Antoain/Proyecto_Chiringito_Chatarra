using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VentaController : ControllerBase
    {
        private readonly VentaDAO _ventasDAO;
        public VentaController(VentaDAO ventasDAO)
        {
            _ventasDAO = ventasDAO;
        }

        // Endpoint para realizar la venta
        [HttpPost("RealizarVenta")]
        public async Task<IActionResult> RealizarVenta([FromBody] Ventum venta)
        {
            if (venta == null)
            {
                return BadRequest(new { mensaje = "Datos de venta incorrectos." });
            }

            try
            {
                var resultado = await _ventasDAO.RealizarVenta(venta);
                if (resultado != null)
                {
                    return Ok(new { mensaje = "Venta realizada correctamente.", idVenta = resultado.IdVenta });
                }
                else
                {
                    return BadRequest(new { mensaje = "Error al realizar la venta." });
                }
            }
            catch (Exception ex)
            {
               
                return BadRequest(new { mensaje = ex.Message });
            }
        }

        // Nuevo endpoint para obtener las ventas
        [HttpGet("ObtenerVentas")]
        public async Task<IActionResult> ObtenerVentas()
        {
            try
            {
                var ventas = await _ventasDAO.ObtenerVentas();
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }


        [HttpGet("ObtenerVentasPorVendedor/{idVendedor}")]
        public async Task<IActionResult> ObtenerVentasPorVendedor(int idVendedor)
        {
            try
            {
                var ventas = await _ventasDAO.ObtenerVentasPorVendedorAsync(idVendedor);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return BadRequest(new { mensaje = ex.Message });
            }
        }

    }
}
