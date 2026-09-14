namespace ChiringuitoCH_Data.DTOs
{
    public class ClienteMineriaDTO
    {
        public int IdCliente { get; set; }

        public int CantidadPedidos { get; set; }

        public int CantidadSubPedidos { get; set; }

        public decimal TotalGastado { get; set; }

        public decimal TicketPromedio { get; set; }

        public int CantidadProductosComprados { get; set; }

        public int CantidadTiendasDiferentes { get; set; }

        public int CantidadPedidosCancelados { get; set; }

        public decimal PorcentajeCancelacion { get; set; }

        public DateTime? FechaPrimeraCompra { get; set; }

        public int? AntiguedadClienteDias { get; set; }

        public int? DiasDesdeUltimaCompra { get; set; }

        public double? FrecuenciaCompraDias { get; set; }

        public int? IdCategoriaFavorita { get; set; }

        public string? MetodoEntregaMasUsado { get; set; }
    }
}