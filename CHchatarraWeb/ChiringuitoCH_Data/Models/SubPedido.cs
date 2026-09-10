using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class SubPedido
{
    public int IdSubPedido { get; set; }

    public int IdPedido { get; set; }

    public int IdTienda { get; set; }

    public decimal Subtotal { get; set; }

    public decimal CostoEnvio { get; set; }

    public decimal ComisionPlataforma { get; set; }

    public decimal TotalVendedor { get; set; }

    public string Estado { get; set; } = null!;

    public DateTime FechaActualizacion { get; set; }

    public virtual Pedido? IdPedidoNavigation { get; set; }

    public virtual Tienda? IdTiendaNavigation { get; set; }

    public string? MetodoEntrega { get; set; }

    public virtual EntregaSubPedido? EntregaSubPedido { get; set; }

    public virtual ICollection<DetalleSubPedido> Detalles { get; set; }
        = new List<DetalleSubPedido>();
}