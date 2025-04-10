using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Evento
{
    public int IdEvento { get; set; }

    public string TipoEvento { get; set; } = null!;

    public string Direccion { get; set; } = null!;

    public DateTime HoraInicio { get; set; }

    public DateTime HoraFin { get; set; }

    public decimal? PrecioEntrada { get; set; }

    public string? FotoLugarUrl { get; set; }

    public string? Descripcion { get; set; }

    public string? VideoUrl { get; set; }

    public string? Ubicacion { get; set; }

    public virtual ICollection<Promocione> Promociones { get; set; } = new List<Promocione>();
}
