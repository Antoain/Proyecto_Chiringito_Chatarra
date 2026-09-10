using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class CambiarEstadoEntregaRequest
    {
        public int IdSubPedido { get; set; }

        public string EstadoEntrega { get; set; } = null!;
    }
}