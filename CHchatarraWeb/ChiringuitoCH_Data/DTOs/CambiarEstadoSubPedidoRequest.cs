using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class CambiarEstadoSubPedidoRequest
    {
        public int IdSubPedido { get; set; }

        public string Estado { get; set; } = null!;
    }
}