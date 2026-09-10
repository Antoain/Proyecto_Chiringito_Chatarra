using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class DevolucionInventarioRequest
    {
        public int IdSubPedido { get; set; }

        public int IdProducto { get; set; }

        public int Cantidad { get; set; }

        public string? Motivo { get; set; }
    }
}