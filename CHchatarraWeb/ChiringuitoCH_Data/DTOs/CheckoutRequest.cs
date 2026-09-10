using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class CheckoutRequest
    {
        public int IdDistrito { get; set; }

        public string DireccionEntrega { get; set; } = null!;

        public string Telefono { get; set; } = null!;

        public string MetodoPago { get; set; } = null!;

        public List<MetodoEntregaCheckoutRequest>
            MetodosEntrega
        { get; set; } = new();
    }
}
