namespace ChiringuitoCH_Data.DTOs
{
    public class ActualizarUsuarioDTO
    {
        public int IdUsuario { get; set; }

        public string? Nombres { get; set; }

        public string? Apellidos { get; set; }

        public string? Correo { get; set; }

        public string? Rol { get; set; }
    }
}