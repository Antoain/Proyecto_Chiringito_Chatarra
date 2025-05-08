using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Favorito
{
    public int IdFavorito { get; set; }

    public int IdUsuario { get; set; }

    public int IdProducto { get; set; }

    public virtual Producto? IdProductoNavigation { get; set; } = null!;

    public virtual Usuario? IdUsuarioNavigation { get; set; } = null!;
}
