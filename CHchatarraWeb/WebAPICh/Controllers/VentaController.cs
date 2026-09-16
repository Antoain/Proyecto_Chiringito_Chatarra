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
                Console.WriteLine(
                    $"Error al realizar venta: {ex}"
                );

                return StatusCode(500, new
                {
                    mensaje =
                        "Ocurrió un error interno al realizar la venta."
                });
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
                Console.WriteLine(
                    $"Error al obtener ventas: {ex}"
                );

                return StatusCode(500, new
                {
                    mensaje =
                        "Ocurrió un error interno al obtener las ventas."
                });
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
                Console.WriteLine(
                    $"Error al obtener ventas del vendedor: {ex}"
                );

                return StatusCode(500, new
                {
                    mensaje =
                        "Ocurrió un error interno al obtener las ventas."
                });
            }
        }

    }
}
