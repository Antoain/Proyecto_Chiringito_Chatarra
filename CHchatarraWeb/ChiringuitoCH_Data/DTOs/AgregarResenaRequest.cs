using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class AgregarResenaRequest
    {
        public int IdProducto { get; set; }
        public int Calificacion { get; set; }
        public string? Comentario { get; set; }
    }
}