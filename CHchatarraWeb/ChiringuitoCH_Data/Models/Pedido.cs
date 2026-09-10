using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Pedido
{
    public int IdPedido { get; set; }

    public int IdUsuario { get; set; }

    public int IdDistrito { get; set; }

    public decimal Subtotal { get; set; }

    public decimal CostoEnvio { get; set; }

    public decimal Total { get; set; }

    public string DireccionEntrega { get; set; } = null!;

    public string Telefono { get; set; } = null!;

    public string MetodoPago { get; set; } = null!;

    public string Estado { get; set; } = null!;

    public DateTime FechaPedido { get; set; }

    public virtual Usuario? IdUsuarioNavigation { get; set; }

    public virtual Distrito? IdDistritoNavigation { get; set; }

    public virtual ICollection<SubPedido> SubPedidos { get; set; }
        = new List<SubPedido>();
}