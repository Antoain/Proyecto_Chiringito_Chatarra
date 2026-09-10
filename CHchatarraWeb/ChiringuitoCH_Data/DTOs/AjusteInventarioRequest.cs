using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class AjusteInventarioRequest
    {
        public int IdProducto { get; set; }

        public int StockFisico { get; set; }

        public string? Motivo { get; set; }
    }
}