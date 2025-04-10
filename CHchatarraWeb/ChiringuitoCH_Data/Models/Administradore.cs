using System;
using System.Collections.Generic;

namespace ChiringuitoCH_Data.Models;

public partial class Administradore
{
    public int IdUsuario { get; set; }

    public DateOnly FechaInicio { get; set; }

    public int? NivelAcceso { get; set; }

    public virtual Usuario IdUsuarioNavigation { get; set; } = null!;
}
