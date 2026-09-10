using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class Inventario
{
    public int IdInventario { get; set; }

    public int IdProducto { get; set; }

    public int StockActual { get; set; }

    public int StockMinimo { get; set; }

    public int? StockMaximo { get; set; }

    public DateTime FechaActualizacion { get; set; }

    public virtual Producto? IdProductoNavigation { get; set; }

    public virtual ICollection<MovimientoInventario> MovimientosInventario
    { get; set; } = new List<MovimientoInventario>();
}
