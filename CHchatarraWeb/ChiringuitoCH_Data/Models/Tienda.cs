    using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Tienda
{
    public int IdTienda { get; set; }

    public int IdVendedor { get; set; }

    public string NombreNegocio { get; set; } = null!;

    public string? RegistroNegocio { get; set; }

    public string? Horario { get; set; }

    public string? FotoFachadaUrl { get; set; }

    public int IdCategoria { get; set; }

    public string? Eslogan { get; set; }

    public string? NumeroContacto { get; set; }

    public string? FacebookUrl { get; set; }

    public string? PaginaWebUrl { get; set; }

    public bool? CuentaEnvio { get; set; }

    public DateOnly? FechaRegistro { get; set; } 

    public virtual Categorium? IdCategoriaNavigation { get; set; } = null!;

    public virtual Vendedore? IdVendedorNavigation { get; set; } = null!;

    public virtual ICollection<Producto> Productos { get; set; } = new List<Producto>();

    public virtual ICollection<Promocione> Promociones { get; set; } = new List<Promocione>();

    public virtual ICollection<ResenasTienda> ResenasTienda { get; set; } = new List<ResenasTienda>();

    public virtual ICollection<Servicio> Servicios { get; set; } = new List<Servicio>();

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
