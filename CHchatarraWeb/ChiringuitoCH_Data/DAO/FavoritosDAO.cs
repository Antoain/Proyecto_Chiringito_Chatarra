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
    public class FavoritosDAO
    {
        private readonly ChChatarra40Context _context;

        public FavoritosDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // 🔹 Obtener favoritos de un usuario
        public async Task<List<Favorito>> ObtenerFavoritosPorUsuario(int idUsuario)
        {
            return await _context.Favoritos
                .Where(f => f.IdUsuario == idUsuario)
                .Include(f => f.IdProductoNavigation)
                .ToListAsync();
        }

        // 🔹 Agregar producto a favoritos
        public async Task<bool> ExisteFavoritoAsync(int idUsuario, int idProducto)
        {
            return await _context.Favoritos
                .AnyAsync(f => f.IdUsuario == idUsuario && f.IdProducto == idProducto);
        }

        public async Task AgregarFavoritoAsync(Favorito nuevoFavorito)
        {
            _context.Favoritos.Add(nuevoFavorito);
            await _context.SaveChangesAsync();
        }


        // 🔹 Eliminar producto de favoritos
        public async Task<bool> EliminarFavorito(int idFavorito)
        {
            var favorito = await _context.Favoritos.FindAsync(idFavorito);
            if (favorito == null) return false;

            _context.Favoritos.Remove(favorito);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
