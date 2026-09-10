using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class EntregaSubPedido
{
    public int IdEntrega { get; set; }

    public int IdSubPedido { get; set; }

    public string MetodoEntrega { get; set; } = null!;

    public string EstadoEntrega { get; set; } = null!;

    public string? ProveedorEntrega { get; set; }

    public string? CodigoSeguimiento { get; set; }

    public DateTime FechaCreacion { get; set; }

    public DateTime FechaActualizacion { get; set; }

    public DateTime? FechaEntrega { get; set; }

    public virtual SubPedido? IdSubPedidoNavigation { get; set; }
    public virtual ICollection<HistorialEntrega> HistorialEntregas
    { get; set; } = new List<HistorialEntrega>();
}