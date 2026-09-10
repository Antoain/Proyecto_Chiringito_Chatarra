using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class EditarProductoRequest
    {
        public string? Nombre { get; set; }
        public string? Descripcion { get; set; }
        public int IdCategoria { get; set; }
        public decimal Precio { get; set; }
        public int Stock { get; set; }
        public string? Sku { get; set; }
        public string? RutaImagen { get; set; }
        public bool Activo { get; set; }
    }
}
