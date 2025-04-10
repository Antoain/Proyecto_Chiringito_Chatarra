using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Provincium
{
    public int IdProvincia { get; set; }

    public string Descripcion { get; set; } = null!;

    public int? IdDepartamento { get; set; }

    public virtual ICollection<Distrito> Distritos { get; set; } = new List<Distrito>();

    public virtual Departamento? IdDepartamentoNavigation { get; set; }
}
