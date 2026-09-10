using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class CarritoDAO
    {
        private readonly ChChatarra40Context _context;

        public CarritoDAO(ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER CARRITO DE UN USUARIO
        // ==========================================

        public async Task<List<Carrito>> ObtenerCarritoPorUsuario(
            int idUsuario)
        {
            return await _context.Carritos
                .Where(c => c.IdUsuario == idUsuario)
                .Include(c => c.IdProductoNavigation)
                .ToListAsync();
        }


        // ==========================================
        // OBTENER CARRITO POR ID
        // ==========================================

        public async Task<Carrito?> ObtenerCarritoPorIdAsync(
            int idCarrito)
        {
            return await _context.Carritos
                .Include(c => c.IdProductoNavigation)
                .FirstOrDefaultAsync(
                    c => c.IdCarrito == idCarrito
                );
        }


        // ==========================================
        // AGREGAR PRODUCTO AL CARRITO
        // ==========================================

        public async Task<bool> AgregarAlCarrito(
            Carrito carrito)
        {
            var productoExiste =
                await _context.Productos
                    .AnyAsync(
                        p => p.IdProducto == carrito.IdProducto
                    );

            if (!productoExiste)
            {
                return false;
            }


            // Comprobar si ya existe el mismo producto
            // en el carrito del usuario
            var carritoExistente =
                await _context.Carritos
                    .FirstOrDefaultAsync(c =>
                        c.IdUsuario == carrito.IdUsuario &&
                        c.IdProducto == carrito.IdProducto
                    );


            if (carritoExistente != null)
            {
                // Si ya estaba, sumamos la cantidad
                carritoExistente.Cantidad += carrito.Cantidad;

                await _context.SaveChangesAsync();

                return true;
            }


            _context.Carritos.Add(carrito);

            await _context.SaveChangesAsync();

            return true;
        }


        // ==========================================
        // ACTUALIZAR CANTIDAD
        // ==========================================

        public async Task<bool> ActualizarCantidadCarrito(
            int idCarrito,
            int nuevaCantidad)
        {
            var carrito =
                await _context.Carritos
                    .FirstOrDefaultAsync(
                        c => c.IdCarrito == idCarrito
                    );


            if (carrito == null)
            {
                return false;
            }


            carrito.Cantidad =
                nuevaCantidad > 0
                    ? nuevaCantidad
                    : 1;


            await _context.SaveChangesAsync();

            return true;
        }


        // ==========================================
        // ELIMINAR PRODUCTO DEL CARRITO
        // ==========================================

        public async Task<bool> EliminarDelCarrito(
            int idCarrito)
        {
            var carrito =
                await _context.Carritos
                    .FirstOrDefaultAsync(
                        c => c.IdCarrito == idCarrito
                    );


            if (carrito == null)
            {
                return false;
            }


            _context.Carritos.Remove(carrito);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}