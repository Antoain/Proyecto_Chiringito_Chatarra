using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class ActualizarSeguimientoEntregaRequest
    {
        public int IdSubPedido { get; set; }

        public string ProveedorEntrega { get; set; } = null!;

        public string CodigoSeguimiento { get; set; } = null!;
    }
}
