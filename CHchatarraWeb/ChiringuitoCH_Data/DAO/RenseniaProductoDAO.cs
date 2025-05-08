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
    public class RenseniaProductoDAO
    {
        private readonly ChChatarra40Context _context;

        public RenseniaProductoDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // 🔹 Obtener reseñas de un producto

        public async Task<List<ResenasProducto>> ObtenerResenasPorProducto(int idProducto)
        {
            return await _context.ResenasProductos
                .Where(r => r.IdProducto == idProducto)
                .Include(r => r.IdUsuarioNavigation)
                .ToListAsync();
        }

        // Nuevo método que proyecta las reseñas a un DTO
        public async Task<List<object>> ObtenerResenasDTOPorProducto(int idProducto)
        {
            var resenasDto = await _context.ResenasProductos
                .Where(r => r.IdProducto == idProducto)
                .Include(r => r.IdUsuarioNavigation)
                .Select(r => new {
                    idResena = r.IdResena,
                    calificacion = r.Calificacion,
                    comentario = r.Comentario,
                    usuario = r.IdUsuarioNavigation != null ? r.IdUsuarioNavigation.Nombres : "Usuario desconocido"
                })
                .ToListAsync();

            return resenasDto.Cast<object>().ToList();
        }

        // 🔹 Agregar reseña a un producto
        public async Task<bool> AgregarResena(ResenasProducto resena)
        {
            // Opcional: Verificar si el producto existe
            if (!_context.Productos.Any(p => p.IdProducto == resena.IdProducto))
                return false; // El producto no existe

            _context.ResenasProductos.Add(resena);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
