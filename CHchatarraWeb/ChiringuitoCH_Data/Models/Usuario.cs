using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Usuario
{
    public int IdUsuario { get; set; }

    public string Nombres { get; set; } = null!;

    public string Apellidos { get; set; } = null!;

    public string Correo { get; set; } = null!;

    public string Clave { get; set; } = null!;

    public string Rol { get; set; } = null!;

    public DateOnly? FechaRegistro { get; set; }

    public virtual Administradore? Administradore { get; set; }

    public virtual ICollection<Carrito> Carritos { get; set; } = new List<Carrito>();

    public virtual ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();

    public virtual ICollection<ResenasProducto> ResenasProductos { get; set; } = new List<ResenasProducto>();

    public virtual ICollection<ResenasTienda> ResenasTienda { get; set; } = new List<ResenasTienda>();

    public virtual Vendedore? Vendedore { get; set; }

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
