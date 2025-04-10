using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Promocione
{
    public int IdPromocion { get; set; }

    public string? Titulo { get; set; }

    public string? Descripcion { get; set; }

    public decimal? Descuento { get; set; }

    public DateOnly? FechaInicio { get; set; }

    public DateOnly? FechaFin { get; set; }

    public int? IdProducto { get; set; }

    public int? IdTienda { get; set; }

    public int? IdEvento { get; set; }

    public virtual Evento? IdEventoNavigation { get; set; }

    public virtual Producto? IdProductoNavigation { get; set; }

    public virtual Tienda? IdTiendaNavigation { get; set; }
}
