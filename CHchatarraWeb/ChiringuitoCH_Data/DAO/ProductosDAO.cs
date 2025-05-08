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
    public class ProductosDAO
    {
        private readonly ChChatarra40Context _context;

        public ProductosDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // Obtener todos los productos
        public async Task<IEnumerable<Producto>> ObtenerProductosAsync()
        {
            return await _context.Productos.ToListAsync();
        }

        // Obtener un producto por ID
        public async Task<Producto> ObtenerProductoPorIdAsync(int id)
        {
            return await _context.Productos.FindAsync(id);
        }

        // Crear un producto
        public async Task CrearProductoAsync(Producto producto)
        {
            _context.Productos.Add(producto);
            await _context.SaveChangesAsync();
        }

        // Actualizar un producto
        public async Task ActualizarProductoAsync(Producto producto)
        {
            _context.Entry(producto).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        // Eliminar un producto por ID
        public async Task EliminarProductoAsync(int id)
        {
            var producto = await _context.Productos.FindAsync(id);
            if (producto != null)
            {
                _context.Productos.Remove(producto);
                await _context.SaveChangesAsync();
            }
        }
        // ObtenerProductoPorVendedor
        public async Task<Vendedore?> ObtenerVendedorPorProductoAsync(int idProducto)
        {
            var producto = await _context.Productos
                .Include(p => p.IdTiendaNavigation)
                .ThenInclude(t => t.IdVendedorNavigation) // ✅ Cargar tienda y vendedor
                .FirstOrDefaultAsync(p => p.IdProducto == idProducto);

            return producto?.IdTiendaNavigation?.IdVendedorNavigation; // ✅ Retornar el vendedor
        }

        public async Task<IEnumerable<Producto>> ObtenerProductosPorVendedorAsync(int idVendedor)
        {
            return await _context.Productos
                .Include(p => p.IdTiendaNavigation) // ✅ Aseguramos que obtenemos la tienda
                .Where(p => p.IdTiendaNavigation.IdVendedor == idVendedor) // ✅ Filtrar por vendedor
                .ToListAsync();
        }




    }
}
