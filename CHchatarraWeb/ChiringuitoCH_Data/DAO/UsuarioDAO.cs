using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChiringuitoCH_Data.DAO
{
    public class UsuarioDAO
    {
        private readonly ChChatarra40Context _context;

        public UsuarioDAO(ChChatarra40Context context)
        {
            _context = context;
        }


        // Obtener todos los usuarios
        public async Task<IEnumerable<Usuario>> ObtenerUsuariosAsync()
        {
            return await _context.Usuarios.ToListAsync();
        }

        // Obtener un usuario por ID
        public async Task<Usuario> ObtenerUsuarioPorIdAsync(int id)
        {
            return await _context.Usuarios.FindAsync(id);
        }

        // Obtener un usuario por correo
        public async Task<Usuario> ObtenerUsuarioPorCorreoAsync(string correo)
        {
            return await _context.Usuarios.FirstOrDefaultAsync(u => u.Correo == correo);
        }

        // Agregar un nuevo usuario
        public async Task AgregarUsuarioAsync(Usuario usuario)
        {
            _context.Usuarios.Add(usuario);
            await _context.SaveChangesAsync();

            //Si el usuario es Vendedor, se registra en la tabla Vendedore**
            if (usuario.Rol == "Vendedor")
            {
                var nuevoVendedor = new Vendedore
                {
                    IdUsuario = usuario.IdUsuario, 
                    FechaInicio = DateOnly.FromDateTime(DateTime.UtcNow), 
                    Rfc = null 
                };

                _context.Vendedores.Add(nuevoVendedor);
                await _context.SaveChangesAsync(); 
            }
        }


        // Actualizar un usuario existente
        public async Task ActualizarUsuarioAsync(Usuario usuario)
        {
            var usuarioExistente = await _context.Usuarios.FindAsync(usuario.IdUsuario);
            if (usuarioExistente == null)
            {
                throw new KeyNotFoundException("El usuario no existe.");
            }

            await _context.SaveChangesAsync();
        }




        // Eliminar un usuario
        public async Task<bool> EliminarUsuarioAsync(int id)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                
                var vendedor = await _context.Vendedores.FirstOrDefaultAsync(v => v.IdUsuario == id);
                if (vendedor != null)
                {
                    _context.Vendedores.Remove(vendedor);
                    await _context.SaveChangesAsync();
                }

                
                var usuario = await _context.Usuarios.FindAsync(id);
                if (usuario == null) return false;

                _context.Usuarios.Remove(usuario);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"Error al eliminar usuario: {ex.Message}");
                throw;
            }
        }


        // autenticacion
        public Usuario VerificarCredenciales(string correo, string clave)
        {
            // Busca en la base de datos un usuario con las credenciales proporcionadas
            return _context.Usuarios.SingleOrDefault(u => u.Correo == correo && u.Clave == clave);
        }
    }
}
