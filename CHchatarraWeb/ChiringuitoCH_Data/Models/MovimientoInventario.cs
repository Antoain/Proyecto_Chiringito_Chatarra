using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models;

public partial class MovimientoInventario
{
    public int IdMovimiento { get; set; }

    public int IdInventario { get; set; }

    public string TipoMovimiento { get; set; } = null!;

    public int Cantidad { get; set; }

    public int StockAnterior { get; set; }

    public int StockNuevo { get; set; }

    public string? Motivo { get; set; }

    public string? Referencia { get; set; }

    public DateTime FechaMovimiento { get; set; }

    public virtual Inventario? IdInventarioNavigation { get; set; }
}