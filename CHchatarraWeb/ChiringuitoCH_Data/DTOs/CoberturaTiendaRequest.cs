using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class CoberturaTiendaRequest
    {
        public int IdTienda { get; set; }

        public int IdDistrito { get; set; }

        public decimal CostoEnvio { get; set; }
    }
}