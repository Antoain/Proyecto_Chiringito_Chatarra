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

        public async Task<List<Favorito>> ObtenerFavoritosPorUsuario(
            int idUsuario)
        {
            return await _context.Favoritos
                .Where(f => f.IdUsuario == idUsuario)
                .Include(f => f.IdProductoNavigation)
                .ToListAsync();
        }

        public async Task<Favorito?> ObtenerFavoritoPorIdAsync(
            int idFavorito)
        {
            return await _context.Favoritos
                .FirstOrDefaultAsync(
                    f => f.IdFavorito == idFavorito
                );
        }

        public async Task<bool> ExisteFavoritoAsync(
            int idUsuario,
            int idProducto)
        {
            return await _context.Favoritos
                .AnyAsync(f =>
                    f.IdUsuario == idUsuario &&
                    f.IdProducto == idProducto
                );
        }

        public async Task AgregarFavoritoAsync(
            Favorito nuevoFavorito)
        {
            _context.Favoritos.Add(nuevoFavorito);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> EliminarFavorito(
            int idFavorito)
        {
            var favorito =
                await _context.Favoritos.FindAsync(idFavorito);

            if (favorito == null)
            {
                return false;
            }

            _context.Favoritos.Remove(favorito);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}