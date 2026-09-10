using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class MetodoEntregaTienda
{
    public int IdMetodoEntrega { get; set; }

    public int IdTienda { get; set; }

    public string TipoMetodo { get; set; } = null!;

    public bool Activo { get; set; }

    public DateTime FechaRegistro { get; set; }

    public virtual Tienda? IdTiendaNavigation { get; set; }
}
