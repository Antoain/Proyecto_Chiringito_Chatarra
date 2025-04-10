using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Distrito
{
    public int IdDistrito { get; set; }

    public string? Descripcion { get; set; }

    public int? IdProvincia { get; set; }

    public virtual Provincium? IdProvinciaNavigation { get; set; }

    public virtual ICollection<Ventum> Venta { get; set; } = new List<Ventum>();
}
