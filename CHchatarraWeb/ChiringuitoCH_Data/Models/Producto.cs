using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Producto
{
    public int IdProducto { get; set; }

    public string Nombre { get; set; } = null!;

    public string? Descripcion { get; set; }

    public int IdTienda { get; set; }

    public int IdCategoria { get; set; }

    public decimal Precio { get; set; }

    public int Stock { get; set; }

    public string? Sku { get; set; }

    public string? RutaImagen { get; set; }

    public bool? Activo { get; set; }

    public DateOnly? FechaRegistro { get; set; }

    public virtual ICollection<Carrito> Carritos { get; set; } = new List<Carrito>();

    public virtual ICollection<DetalleVentum> DetalleVenta { get; set; } = new List<DetalleVentum>();

    public virtual ICollection<Favorito> Favoritos { get; set; } = new List<Favorito>();

    public virtual Categorium? IdCategoriaNavigation { get; set; } = null!;

    public virtual Tienda? IdTiendaNavigation { get; set; } = null!;

    public virtual ICollection<Promocione> Promociones { get; set; } = new List<Promocione>();

    public virtual ICollection<ResenasProducto> ResenasProductos { get; set; } = new List<ResenasProducto>();
}
