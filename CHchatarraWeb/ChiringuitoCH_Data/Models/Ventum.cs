using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Ventum
{
    public int IdVenta { get; set; }

    public int IdUsuario { get; set; }

    public int IdTienda { get; set; }

    public int TotalProducto { get; set; }

    public decimal MontoTotal { get; set; }

    public string Direccion { get; set; } = null!;

    public int IdDistrito { get; set; }

    public string Telefono { get; set; } = null!;

    public DateOnly? FechaVenta { get; set; }

    public string? Estado { get; set; }

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual Distrito IdDistritoNavigation { get; set; } = null!;

    public virtual Tienda IdTiendaNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
