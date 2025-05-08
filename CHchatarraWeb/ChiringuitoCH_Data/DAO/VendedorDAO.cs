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
    public class VendedorDAO
    {
        private readonly ChChatarra40Context _context;

        public VendedorDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // Obtener todos los vendedores
        public async Task<IEnumerable<Vendedore>> ObtenerVendedoresAsync()
        {
            return await _context.Vendedores
                .Include(v => v.IdUsuarioNavigation)  // Incluir datos del usuario relacionado
                .ToListAsync();
        }

        // Obtener un vendedor por ID
        public async Task<Vendedore?> ObtenerVendedorPorIdAsync(int id)
        {
            return await _context.Vendedores
                .Include(v => v.IdUsuarioNavigation) // Traer datos relacionados de Usuarios
                .FirstOrDefaultAsync(v => v.IdUsuario == id);
        }


        // Crear un nuevo vendedor
        public async Task CrearVendedorAsync(Vendedore vendedor)
        {
            _context.Vendedores.Add(vendedor);  
            await _context.SaveChangesAsync();  
        }



        // Actualizar un vendedor
        public async Task ActualizarVendedorAsync(Vendedore vendedor)
        {
            _context.Entry(vendedor).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        // Eliminar un vendedor por ID
        public async Task EliminarVendedorAsync(int id)
        {
            var vendedor = await _context.Vendedores.FindAsync(id);
            if (vendedor != null)
            {
                _context.Vendedores.Remove(vendedor);
                await _context.SaveChangesAsync();
            }
        }

        


    }
}
