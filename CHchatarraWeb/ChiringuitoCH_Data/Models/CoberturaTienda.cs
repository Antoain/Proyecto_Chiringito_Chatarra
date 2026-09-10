using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models
{
    public partial class CoberturaTienda
    {
        public int IdCobertura { get; set; }

        public int IdTienda { get; set; }

        public int IdDistrito { get; set; }

        public decimal CostoEnvio { get; set; }

        public bool Activo { get; set; }

        public DateTime FechaRegistro { get; set; }

        public virtual Tienda? IdTiendaNavigation { get; set; }

        public virtual Distrito? IdDistritoNavigation { get; set; }
    }
}
