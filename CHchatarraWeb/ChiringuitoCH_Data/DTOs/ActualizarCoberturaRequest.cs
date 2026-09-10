using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class ActualizarCoberturaRequest
    {
        public decimal CostoEnvio { get; set; }

        public bool Activo { get; set; }
    }
}
