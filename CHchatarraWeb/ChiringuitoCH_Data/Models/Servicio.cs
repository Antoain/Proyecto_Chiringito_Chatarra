using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Servicio
{
    public int IdServicio { get; set; }

    public int IdTienda { get; set; }

    public string? EmpresaServicio { get; set; }

    public string? NombreServicio { get; set; }

    public string? CategoriaServicio { get; set; }

    public string? AreaServicio { get; set; }

    public string? Descripcion { get; set; }

    public string? Materiales { get; set; }

    public string? TiempoEstimado { get; set; }

    public virtual Tienda IdTiendaNavigation { get; set; } = null!;
}
