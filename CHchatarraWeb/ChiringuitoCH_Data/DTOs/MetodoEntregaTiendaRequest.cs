using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class MetodoEntregaTiendaRequest
    {
        public int IdTienda { get; set; }

        public string TipoMetodo { get; set; }
            = null!;
    }
}