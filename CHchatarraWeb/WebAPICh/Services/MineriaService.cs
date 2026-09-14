using System.Net.Http.Json;
using System.Text.Json;

namespace WebAPICh.Services
{
    public class ClienteRecurrenciaRequest
    {
        public decimal TotalGastado { get; set; }
        public decimal TicketPromedio { get; set; }
        public int CantidadProductosComprados { get; set; }
        public int CantidadTiendasDiferentes { get; set; }
        public decimal PorcentajeCancelacion { get; set; }
        public double AntiguedadClienteDias { get; set; }
        public double DiasDesdeUltimaCompra { get; set; }
        public double FrecuenciaCompraDias { get; set; }
        public int IdCategoriaFavorita { get; set; }
        public string MetodoEntregaMasUsado { get; set; } = "";
    }


    public class PrediccionRecurrenciaResponse
    {
        public double ProbabilidadRecurrencia { get; set; }
        public double Umbral { get; set; }
        public int ClienteRecurrentePredicho { get; set; }
    }

    public class ClienteSegmentacionRequest
    {
        public decimal TotalGastado { get; set; }
        public decimal TicketPromedio { get; set; }
        public int CantidadProductosComprados { get; set; }
        public int CantidadTiendasDiferentes { get; set; }
        public decimal PorcentajeCancelacion { get; set; }
        public double AntiguedadClienteDias { get; set; }
        public double DiasDesdeUltimaCompra { get; set; }
        public double FrecuenciaCompraDias { get; set; }
    }

    public class SegmentacionResponse
    {
        public int Cluster { get; set; }
        public string Segmento { get; set; } = "";
    }


    public class MineriaService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public MineriaService(
            IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }


        // ==========================================
        // HEALTH CHECK PYTHON
        // ==========================================

        public async Task<object?> VerificarServicioAsync()
        {
            var cliente =
                _httpClientFactory.CreateClient(
                    "MineriaAPI"
                );

            var response =
                await cliente.GetAsync(
                    "/health"
                );

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var contenido =
                await response.Content
                    .ReadAsStringAsync();

            return JsonSerializer.Deserialize<object>(
                contenido
            );
        }


        // ==========================================
        // PREDICCIÓN DE RECURRENCIA
        // ==========================================

        public async Task<PrediccionRecurrenciaResponse?>
        PredecirRecurrenciaAsync(
        ClienteRecurrenciaRequest datosCliente)
        {
            var cliente =
                _httpClientFactory.CreateClient(
                    "MineriaAPI"
                );

            var opcionesJson =
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = null
                };

            var contenido =
                JsonContent.Create(
                    datosCliente,
                    options: opcionesJson
                );

            var response =
                await cliente.PostAsync(
                    "/modelo/recurrencia/predecir",
                    contenido
                );

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content
                        .ReadAsStringAsync();

                throw new Exception(
                    $"Error en API de minería: {error}"
                );
            }

            return await response.Content
                .ReadFromJsonAsync<
                    PrediccionRecurrenciaResponse
                >();
        }

        // ==========================================
        // PREDICCIÓN DE Segmentacion
        // ==========================================

        public async Task<SegmentacionResponse?>
        PredecirSegmentacionAsync(
        ClienteSegmentacionRequest datosCliente)
        {
            var cliente =
                _httpClientFactory.CreateClient(
                    "MineriaAPI"
                );

            var opcionesJson =
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = null
                };

            var contenido =
                JsonContent.Create(
                    datosCliente,
                    options: opcionesJson
                );

            var response =
                await cliente.PostAsync(
                    "/modelo/segmentacion/predecir",
                    contenido
                );

            if (!response.IsSuccessStatusCode)
            {
                var error =
                    await response.Content
                        .ReadAsStringAsync();

                throw new Exception(
                    $"Error en API de minería: {error}"
                );
            }

            return await response.Content
                .ReadFromJsonAsync<
                    SegmentacionResponse
                >();
        }
    }
}