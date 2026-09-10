using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DTOs
{
    public class EditarTiendaRequest
    {
        public string? NombreNegocio { get; set; }
        public string? RegistroNegocio { get; set; }
        public string? Horario { get; set; }
        public string? FotoFachadaUrl { get; set; }
        public int IdCategoria { get; set; }
        public string? Eslogan { get; set; }
        public string? NumeroContacto { get; set; }
        public string? FacebookUrl { get; set; }
        public string? PaginaWebUrl { get; set; }
        public bool CuentaEnvio { get; set; }
    }
}