using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class HistorialEntrega
{
    public int IdHistorial { get; set; }

    public int IdEntrega { get; set; }

    public string? EstadoAnterior { get; set; }

    public string EstadoNuevo { get; set; } = null!;

    public DateTime FechaCambio { get; set; }

    public string? Observacion { get; set; }

    public virtual EntregaSubPedido? IdEntregaNavigation { get; set; }
}