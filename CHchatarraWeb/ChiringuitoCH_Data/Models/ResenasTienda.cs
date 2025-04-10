using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class ResenasTienda
{
    public int IdResena { get; set; }

    public int IdUsuario { get; set; }

    public int IdTienda { get; set; }

    public int Calificacion { get; set; }

    public string? Comentario { get; set; }

    public virtual Tienda IdTiendaNavigation { get; set; } = null!;

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
