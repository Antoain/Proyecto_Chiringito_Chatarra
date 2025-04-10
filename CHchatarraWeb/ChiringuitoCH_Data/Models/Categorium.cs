using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Categorium
{
    public int IdCategoria { get; set; }

    public string Descripcion { get; set; } = null!;

    public bool? Activo { get; set; }

    public DateOnly? FechaRegistro { get; set; }

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Tienda> Tienda { get; set; } = new List<Tienda>();
}
