using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class VendedorDTO
    {
        public int IdUsuario { get; set; } // ID del vendedor
        public string? NombresUsuario { get; set; } // Nombre del usuario
        public string? ApellidosUsuario { get; set; } // Apellidos del usuario
        public string? CorreoUsuario { get; set; } // Correo electrónico del usuario
        public string? Rol { get; set; } // Rol del usuario (e.g., "Vendedor")
        public DateOnly FechaInicio { get; set; } // Fecha de inicio como vendedor
        public string? Rfc { get; set; } // RFC del vendedor
    }

}
