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
    public class CarritoDAO
    {
        private readonly ChChatarra40Context _context;

        public CarritoDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // 🔹 Obtener productos en el carrito de un usuario
        public async Task<List<Carrito>> ObtenerCarritoPorUsuario(int idUsuario)
        {
            return await _context.Carritos
                .Where(c => c.IdUsuario == idUsuario)
                .Include(c => c.IdProductoNavigation)
                .ToListAsync();
        }

        // 🔹 Agregar producto al carrito
        public async Task<bool> AgregarAlCarrito(Carrito carrito)
        {
            if (!_context.Productos.Any(p => p.IdProducto == carrito.IdProducto))
                return false; // Producto no existe

            _context.Carritos.Add(carrito);
            await _context.SaveChangesAsync();
            return true;
        }
        // 🔹 Actualizar cantidad de un producto en el carrito
        public async Task<bool> ActualizarCantidadCarrito(int idCarrito, int nuevaCantidad)
        {
            var carrito = await _context.Carritos.FirstOrDefaultAsync(c => c.IdCarrito == idCarrito);

            if (carrito == null)
                return false; // ✅ Si el producto no está en el carrito, retorna falso

            // ✅ Asegurar que la cantidad nunca sea menor a 1
            carrito.Cantidad = nuevaCantidad > 0 ? nuevaCantidad : 1;

            _context.Carritos.Update(carrito); // ✅ Marca el objeto como modificado
            await _context.SaveChangesAsync(); // ✅ Guarda los cambios en la base de datos
            return true;
        }



        // 🔹 Eliminar producto del carrito
        public async Task<bool> EliminarDelCarrito(int idCarrito)
        {
            var carrito = await _context.Carritos.FindAsync(idCarrito);
            if (carrito == null) return false;

            _context.Carritos.Remove(carrito);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
