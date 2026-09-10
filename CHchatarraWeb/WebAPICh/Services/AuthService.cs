using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace WebAPICh.Services
{
    public class AuthService
    {
        private readonly PasswordHasher<Usuario> _passwordHasher;
        private readonly IConfiguration _configuration;

        public AuthService(IConfiguration configuration)
        {
            _passwordHasher = new PasswordHasher<Usuario>();
            _configuration = configuration;
        }

        public string HashPassword(Usuario usuario, string password)
        {
            return _passwordHasher.HashPassword(usuario, password);
        }

        public bool VerifyPassword(Usuario usuario, string passwordIngresado)
        {
            var resultado = _passwordHasher.VerifyHashedPassword(
                usuario,
                usuario.Clave,
                passwordIngresado
            );

            return resultado == PasswordVerificationResult.Success ||
                   resultado == PasswordVerificationResult.SuccessRehashNeeded;
        }

        public string GenerateJwt(Usuario usuario)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                throw new InvalidOperationException(
                    "La clave JWT no está configurada."
                );
            }

            var claims = new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    usuario.IdUsuario.ToString()
                ),

                new Claim(
                    ClaimTypes.Email,
                    usuario.Correo
                ),

                new Claim(
                    ClaimTypes.Role,
                    usuario.Rol
                ),

                new Claim(
                    ClaimTypes.Name,
                    $"{usuario.Nombres} {usuario.Apellidos}"
                )
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}