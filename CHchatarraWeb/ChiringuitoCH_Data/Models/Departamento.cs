using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Departamento
{
    public int IdDepartamento { get; set; }

    public string Descripcion { get; set; } = null!;

    public virtual ICollection<Provincium> Provincia { get; set; } = new List<Provincium>();
}
