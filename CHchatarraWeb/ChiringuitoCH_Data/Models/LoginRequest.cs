using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.Models
{
    public class LoginRequest
    {
        [Required]
        public string Correo { get; set; }

        [Required]
        public string Clave { get; set; }
    }
}
