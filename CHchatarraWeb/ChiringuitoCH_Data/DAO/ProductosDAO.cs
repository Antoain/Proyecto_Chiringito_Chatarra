using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
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

        // ==========================================
        // OBTENER TODOS LOS PRODUCTOS
        // ==========================================

        public async Task<IEnumerable<Producto>> ObtenerProductosAsync()
        {
            return await _context.Productos
                .ToListAsync();
        }


        // ==========================================
        // OBTENER PRODUCTO POR ID
        // ==========================================

        public async Task<Producto?> ObtenerProductoPorIdAsync(int id)
        {
            return await _context.Productos
                .FindAsync(id);
        }


        // ==========================================
        // CREAR PRODUCTO + INVENTARIO
        // ==========================================

        public async Task CrearProductoAsync(Producto producto)
        {
            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // ======================================
                // 1. CREAR PRODUCTO
                // ======================================

                _context.Productos.Add(producto);

                await _context.SaveChangesAsync();


                // ======================================
                // 2. CREAR INVENTARIO AUTOMÁTICAMENTE
                // ======================================

                var inventario = new Inventario
                {
                    IdProducto =
                        producto.IdProducto,

                    StockActual =
                        producto.Stock,

                    StockMinimo =
                        5,

                    StockMaximo =
                        null,

                    FechaActualizacion =
                        DateTime.Now
                };


                _context.Inventarios.Add(inventario);

                await _context.SaveChangesAsync();


                // ======================================
                // 3. CONFIRMAR TRANSACCIÓN
                // ======================================

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();

                throw;
            }
        }


        // ==========================================
        // ACTUALIZAR PRODUCTO
        // ==========================================

        public async Task ActualizarProductoAsync(
            Producto producto)
        {
            _context.Entry(producto).State =
                EntityState.Modified;

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ELIMINAR PRODUCTO
        // ==========================================

        public async Task EliminarProductoAsync(int id)
        {
            var producto =
                await _context.Productos
                    .FindAsync(id);

            if (producto != null)
            {
                _context.Productos.Remove(producto);

                await _context.SaveChangesAsync();
            }
        }


        // ==========================================
        // OBTENER VENDEDOR DEL PRODUCTO
        // ==========================================

        public async Task<Vendedore?>
            ObtenerVendedorPorProductoAsync(
                int idProducto)
        {
            var producto =
                await _context.Productos

                    .Include(p =>
                        p.IdTiendaNavigation)

                    .ThenInclude(t =>
                        t.IdVendedorNavigation)

                    .FirstOrDefaultAsync(p =>
                        p.IdProducto == idProducto);


            return producto?
                .IdTiendaNavigation?
                .IdVendedorNavigation;
        }


        // ==========================================
        // OBTENER PRODUCTOS POR VENDEDOR
        // ==========================================

        public async Task<IEnumerable<Producto>>
            ObtenerProductosPorVendedorAsync(
                int idVendedor)
        {
            return await _context.Productos

                .Include(p =>
                    p.IdTiendaNavigation)

                .Where(p =>
                    p.IdTiendaNavigation != null &&
                    p.IdTiendaNavigation.IdVendedor
                        == idVendedor)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER INVENTARIO POR PRODUCTO
        // ==========================================

        public async Task<Inventario?>
            ObtenerInventarioPorProductoAsync(
                int idProducto)
        {
            return await _context.Inventarios

                .FirstOrDefaultAsync(i =>
                    i.IdProducto == idProducto);
        }


        // ==========================================
        // ACTUALIZAR INVENTARIO
        // ==========================================

        public async Task ActualizarInventarioAsync(
            Inventario inventario)
        {
            _context.Inventarios.Update(inventario);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // REGISTRAR MOVIMIENTO DE INVENTARIO
        // ==========================================

        public async Task
            RegistrarMovimientoInventarioAsync(
                MovimientoInventario movimiento)
        {
            _context.MovimientosInventario
                .Add(movimiento);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR PRODUCTO + INVENTARIO
        // + MOVIMIENTO EN UNA TRANSACCIÓN
        // ==========================================

        public async Task
            ActualizarProductoConInventarioAsync(
                Producto producto,
                Inventario inventario,
                MovimientoInventario? movimiento)
        {
            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                // ======================================
                // 1. ACTUALIZAR PRODUCTO
                // ======================================

                _context.Entry(producto).State =
                    EntityState.Modified;


                // ======================================
                // 2. ACTUALIZAR INVENTARIO
                // ======================================

                _context.Inventarios
                    .Update(inventario);


                // ======================================
                // 3. REGISTRAR MOVIMIENTO
                // SI HUBO CAMBIO DE STOCK
                // ======================================

                if (movimiento != null)
                {
                    _context.MovimientosInventario
                        .Add(movimiento);
                }


                // ======================================
                // 4. GUARDAR CAMBIOS
                // ======================================

                await _context.SaveChangesAsync();


                // ======================================
                // 5. CONFIRMAR
                // ======================================

                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();

                throw;
            }
        }
    }
}