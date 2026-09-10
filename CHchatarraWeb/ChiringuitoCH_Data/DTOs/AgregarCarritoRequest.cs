using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class AgregarCarritoRequest
    {
        public int IdProducto { get; set; }
        public int Cantidad { get; set; }
    }
}
