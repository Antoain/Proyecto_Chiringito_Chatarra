using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Vendedore
{
    public int IdUsuario { get; set; }

    public DateOnly FechaInicio { get; set; }

    public string? Rfc { get; set; }

    public virtual Usuario? IdUsuarioNavigation { get; set; } 

    public virtual ICollection<Tienda> Tienda { get; set; } = new List<Tienda>();
}
