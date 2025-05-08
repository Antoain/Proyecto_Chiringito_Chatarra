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
    public class TiendaDAO
    {
        private readonly ChChatarra40Context _context;

        public TiendaDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // Obtener todas las tiendas
        public async Task<IEnumerable<Tienda>> ObtenerTiendasAsync()
        {
            return await _context.Tiendas.ToListAsync();
        }

        // Obtener una tienda por ID
        public async Task<Tienda> ObtenerTiendaPorIdAsync(int id)
        {
            return await _context.Tiendas.FindAsync(id);
        }

        // Crear una nueva tienda
        public async Task CrearTiendaAsync(Tienda tienda)
        {
            _context.Tiendas.Add(tienda);
            await _context.SaveChangesAsync();
        }


        // Actualizar una tienda
        public async Task ActualizarTiendaAsync(Tienda tienda)
        {
            // Se utiliza EntityState.Modified para indicar cambios en la entidad
            _context.Entry(tienda).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        // Eliminar una tienda por ID
        public async Task EliminarTiendaAsync(int id)
        {       
            var tienda = await _context.Tiendas.FindAsync(id);
            if (tienda != null)
            {
                _context.Tiendas.Remove(tienda);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Tienda>> ObtenerTiendasPorVendedorAsync(int idVendedor)
        {
            return await _context.Tiendas
                .Where(t => t.IdVendedor == idVendedor) // ✅ Filtra por ID del vendedor
                .ToListAsync();
        }


    }
}
