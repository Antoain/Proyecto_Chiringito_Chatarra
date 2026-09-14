using Microsoft.AspNetCore.Mvc;
using WebAPICh.Services;
using ChiringuitoCH_Data.DAO;
using Microsoft.AspNetCore.Authorization;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Administrador")]
    public class MineriaController : ControllerBase
    {
        private readonly MineriaService _mineriaService;
        private readonly SIGAdministradorDAO _sigAdministradorDAO;

        public MineriaController(
            MineriaService mineriaService,
            SIGAdministradorDAO sigAdministradorDAO)
        {
            _mineriaService =
                mineriaService;

            _sigAdministradorDAO =
                sigAdministradorDAO;
        }


        // ==========================================
        // HEALTH CHECK
        // ==========================================

        [HttpGet("Health")]
        public async Task<IActionResult> Health()
        {
            var respuesta =
                await _mineriaService
                    .VerificarServicioAsync();

            if (respuesta == null)
            {
                return StatusCode(
                    503,
                    new
                    {
                        mensaje =
                            "El servicio de minería no está disponible."
                    }
                );
            }

            return Ok(
                new
                {
                    mensaje =
                        "Conexión ASP.NET Core -> Python correcta",

                    servicioPython =
                        respuesta
                }
            );
        }


        // ==========================================
        // PREDICCIÓN DE RECURRENCIA
        // ==========================================

        [HttpPost("Recurrencia")]
        public async Task<IActionResult> Recurrencia(
            [FromBody]
            ClienteRecurrenciaRequest datosCliente)
        {
            try
            {
                var resultado =
                    await _mineriaService
                        .PredecirRecurrenciaAsync(
                            datosCliente
                        );

                return Ok(resultado);
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible realizar la predicción."

                    }
                );
            }
        }


        // ==========================================
        // PREDICCIÓN DE Segmentacion
        // ==========================================

        [HttpPost("Segmentacion")]
        public async Task<IActionResult> Segmentacion(
        [FromBody]
        ClienteSegmentacionRequest datosCliente)
        {
            try
            {
                var resultado =
                    await _mineriaService
                        .PredecirSegmentacionAsync(
                            datosCliente
                        );

                return Ok(resultado);
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible realizar la segmentación."
                    }
                );
            }
        }



        // ==========================================
        // PREDICCIÓN DE Recurrencia por ID
        // =========================================

        [HttpGet("Recurrencia/{idCliente}")]
        public async Task<IActionResult>
            RecurrenciaPorCliente(
                int idCliente)
        {
            try
            {
                var cliente =
                    await _sigAdministradorDAO
                        .ObtenerClienteMineriaPorIdAsync(
                            idCliente
                        );


                if (cliente == null)
                {
                    return NotFound(
                        new
                        {
                            mensaje =
                                "El cliente no existe."
                        }
                    );
                }


                // El modelo necesita historial
                // suficiente para calcular frecuencia.
                if (!cliente
                        .FrecuenciaCompraDias
                        .HasValue ||
                    !cliente
                        .AntiguedadClienteDias
                        .HasValue ||
                    !cliente
                        .DiasDesdeUltimaCompra
                        .HasValue ||
                    !cliente
                        .IdCategoriaFavorita
                        .HasValue ||
                    string.IsNullOrWhiteSpace(
                        cliente
                            .MetodoEntregaMasUsado
                    ))
                {
                    return BadRequest(
                        new
                        {
                            mensaje =
                                "El cliente no posee historial suficiente para realizar la predicción.",

                            idCliente =
                                cliente.IdCliente,

                            cantidadPedidos =
                                cliente.CantidadPedidos
                        }
                    );
                }


                var datosModelo =
                    new ClienteRecurrenciaRequest
                    {
                        TotalGastado =
                            cliente.TotalGastado,

                        TicketPromedio =
                            cliente.TicketPromedio,

                        CantidadProductosComprados =
                            cliente
                                .CantidadProductosComprados,

                        CantidadTiendasDiferentes =
                            cliente
                                .CantidadTiendasDiferentes,

                        PorcentajeCancelacion =
                            cliente
                                .PorcentajeCancelacion,

                        AntiguedadClienteDias =
                            cliente
                                .AntiguedadClienteDias
                                .Value,

                        DiasDesdeUltimaCompra =
                            cliente
                                .DiasDesdeUltimaCompra
                                .Value,

                        FrecuenciaCompraDias =
                            cliente
                                .FrecuenciaCompraDias
                                .Value,

                        IdCategoriaFavorita =
                            cliente
                                .IdCategoriaFavorita
                                .Value,

                        MetodoEntregaMasUsado =
                            cliente
                                .MetodoEntregaMasUsado!
                    };


                var prediccion =
                    await _mineriaService
                        .PredecirRecurrenciaAsync(
                            datosModelo
                        );


                return Ok(
                    new
                    {
                        idCliente =
                            cliente.IdCliente,

                        datosCliente =
                            cliente,

                        prediccion =
                            prediccion
                    }
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible realizar la predicción de recurrencia."
                    }
                );
            }
        }

        // ==========================================
        // PREDICCIÓN DE Segmentacion por ID
        // ==========================================

        [HttpGet("Segmento/{idCliente}")]
        public async Task<IActionResult>
            SegmentoPorCliente(
                int idCliente)
        {
            try
            {
                var cliente =
                    await _sigAdministradorDAO
                        .ObtenerClienteMineriaPorIdAsync(
                            idCliente
                        );


                if (cliente == null)
                {
                    return NotFound(
                        new
                        {
                            mensaje =
                                "El cliente no existe."
                        }
                    );
                }


                if (!cliente
                        .AntiguedadClienteDias
                        .HasValue ||
                    !cliente
                        .DiasDesdeUltimaCompra
                        .HasValue ||
                    !cliente
                        .FrecuenciaCompraDias
                        .HasValue)
                {
                    return BadRequest(
                        new
                        {
                            mensaje =
                                "El cliente no posee historial suficiente para realizar la segmentación.",

                            idCliente =
                                cliente.IdCliente,

                            cantidadPedidos =
                                cliente.CantidadPedidos
                        }
                    );
                }


                var datosModelo =
                    new ClienteSegmentacionRequest
                    {
                        TotalGastado =
                            cliente.TotalGastado,

                        TicketPromedio =
                            cliente.TicketPromedio,

                        CantidadProductosComprados =
                            cliente
                                .CantidadProductosComprados,

                        CantidadTiendasDiferentes =
                            cliente
                                .CantidadTiendasDiferentes,

                        PorcentajeCancelacion =
                            cliente
                                .PorcentajeCancelacion,

                        AntiguedadClienteDias =
                            cliente
                                .AntiguedadClienteDias
                                .Value,

                        DiasDesdeUltimaCompra =
                            cliente
                                .DiasDesdeUltimaCompra
                                .Value,

                        FrecuenciaCompraDias =
                            cliente
                                .FrecuenciaCompraDias
                                .Value
                    };


                var segmentacion =
                    await _mineriaService
                        .PredecirSegmentacionAsync(
                            datosModelo
                        );


                return Ok(
                    new
                    {
                        idCliente =
                            cliente.IdCliente,

                        datosCliente =
                            cliente,

                        segmentacion =
                            segmentacion
                    }
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible realizar la segmentación del cliente."
                    }
                );
            }
        }

        // ==========================================
        // PREDICCIÓN recomendaciones por ID
        // ==========================================

        [HttpGet("Recomendaciones/{idCliente}")]
        public async Task<IActionResult>
            RecomendacionesPorCliente(
                int idCliente)
        {
            try
            {
                var resultado =
                    await _sigAdministradorDAO
                        .ObtenerRecomendacionesClienteAsync(
                            idCliente,
                            5
                        );


                if (resultado == null)
                {
                    return NotFound(
                        new
                        {
                            mensaje =
                                "El cliente no existe."
                        }
                    );
                }


                return Ok(
                    resultado
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible generar las recomendaciones."
                    }
                );
            }
        }


        // ==========================================
        // PREDICCIÓN Comportamiento por ID
        // ==========================================

        [HttpGet("Comportamiento/{idCliente}")]
        public async Task<IActionResult>
            ComportamientoPorCliente(
                int idCliente)
        {
            try
            {
                var resultado =
                    await _sigAdministradorDAO
                        .ObtenerComportamientoClienteAsync(
                            idCliente
                        );


                if (resultado == null)
                {
                    return NotFound(
                        new
                        {
                            mensaje =
                                "El cliente no existe."
                        }
                    );
                }


                return Ok(
                    resultado
                );
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible analizar el comportamiento del cliente."
                    }
                );
            }
        }

        [HttpGet("Clientes")]
        public async Task<IActionResult> ObtenerClientes()
        {
            try
            {
                var clientes =
                    await _sigAdministradorDAO
                        .ObtenerClientesMineriaAsync();

                return Ok(clientes);
            }
            catch (Exception)
            {
                return StatusCode(
                    500,
                    new
                    {
                        mensaje =
                            "No fue posible obtener los clientes."
                    }
                );
            }
        }
    }
}