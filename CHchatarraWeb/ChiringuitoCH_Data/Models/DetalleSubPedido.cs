using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class DetalleSubPedido
{
    public int IdDetalleSubPedido { get; set; }

    public int IdSubPedido { get; set; }

    public int IdProducto { get; set; }

    public int Cantidad { get; set; }

    public decimal PrecioUnitario { get; set; }

    public decimal Descuento { get; set; }

    public decimal Subtotal { get; set; }

    public virtual SubPedido? IdSubPedidoNavigation { get; set; }

    public virtual Producto? IdProductoNavigation { get; set; }
}