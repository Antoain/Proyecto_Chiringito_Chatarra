namespace ChiringuitoCH_Data.DTOs
{
    public class CrearPromocionRequest
    {
        public int IdProducto { get; set; }

        public string Titulo { get; set; } = null!;

        public string? Descripcion { get; set; }

        public decimal Descuento { get; set; }

        public DateOnly FechaInicio { get; set; }

        public DateOnly FechaFin { get; set; }
    }
}