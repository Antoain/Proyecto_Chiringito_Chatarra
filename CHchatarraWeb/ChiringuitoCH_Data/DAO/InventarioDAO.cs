using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class InventarioDAO
    {
        private readonly ChChatarra40Context _context;

        public InventarioDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER INVENTARIO POR PRODUCTO
        // ==========================================

        public async Task<Inventario?>
            ObtenerInventarioPorProductoAsync(
                int idProducto)
        {
            return await _context.Inventarios
                .Include(i => i.IdProductoNavigation)
                .FirstOrDefaultAsync(
                    i => i.IdProducto == idProducto
                );
        }


        // ==========================================
        // OBTENER INVENTARIO DE UNA TIENDA
        // ==========================================

        public async Task<List<Inventario>>
            ObtenerInventarioPorTiendaAsync(
                int idTienda)
        {
            return await _context.Inventarios
                .Include(i => i.IdProductoNavigation)
                .Where(i =>
                    i.IdProductoNavigation != null &&
                    i.IdProductoNavigation.IdTienda == idTienda
                )
                .OrderBy(i =>
                    i.IdProductoNavigation!.Nombre
                )
                .ToListAsync();
        }


        // ==========================================
        // OBTENER STOCK BAJO DE UNA TIENDA
        // ==========================================

        public async Task<List<Inventario>>
            ObtenerStockBajoPorTiendaAsync(
                int idTienda)
        {
            return await _context.Inventarios
                .Include(i => i.IdProductoNavigation)
                .Where(i =>
                    i.IdProductoNavigation != null &&
                    i.IdProductoNavigation.IdTienda == idTienda &&
                    i.StockActual <= i.StockMinimo
                )
                .OrderBy(i =>
                    i.StockActual
                )
                .ToListAsync();
        }


        // ==========================================
        // REGISTRAR MOVIMIENTO
        // ==========================================

        public async Task RegistrarMovimientoAsync(
            MovimientoInventario movimiento)
        {
            _context.MovimientosInventario.Add(
                movimiento
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR INVENTARIO
        // ==========================================

        public async Task ActualizarInventarioAsync(
            Inventario inventario)
        {
            _context.Inventarios.Update(
                inventario
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR STOCK DEL PRODUCTO
        // ==========================================

        public async Task ActualizarProductoAsync(
            Producto producto)
        {
            _context.Productos.Update(
                producto
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // HISTORIAL DE MOVIMIENTOS
        // ==========================================

        public async Task<List<MovimientoInventario>>
            ObtenerMovimientosAsync(
                int idInventario)
        {
            return await _context.MovimientosInventario
                .Where(m =>
                    m.IdInventario == idInventario
                )
                .OrderByDescending(m =>
                    m.FechaMovimiento
                )
                .ToListAsync();
        }


        // ==========================================
        // INVENTARIO DE LAS TIENDAS DEL VENDEDOR
        // ==========================================

        public async Task<List<Inventario>>
            ObtenerInventarioPorVendedorAsync(
                int idVendedor)
        {
            return await _context.Inventarios
                .Include(i => i.IdProductoNavigation)
                    .ThenInclude(p =>
                        p.IdTiendaNavigation
                    )
                .Where(i =>
                    i.IdProductoNavigation != null &&
                    i.IdProductoNavigation.IdTiendaNavigation != null &&
                    i.IdProductoNavigation.IdTiendaNavigation.IdVendedor
                        == idVendedor
                )
                .OrderBy(i =>
                    i.IdProductoNavigation!.Nombre
                )
                .ToListAsync();
        }


        // ==========================================
        // OBTENER INVENTARIO + TIENDA
        // ==========================================

        public async Task<Inventario?>
            ObtenerInventarioCompletoPorProductoAsync(
                int idProducto)
        {
            return await _context.Inventarios
                .Include(i => i.IdProductoNavigation)
                    .ThenInclude(p =>
                        p.IdTiendaNavigation
                    )
                .FirstOrDefaultAsync(
                    i => i.IdProducto == idProducto
                );
        }

        // ==========================================
        // OBTENER STOCK BAJO POR VENDEDOR
        // ==========================================

        public async Task<List<Inventario>>
            ObtenerStockBajoPorVendedorAsync(
                int idVendedor)
        {
            return await _context.Inventarios

                .Include(i =>
                    i.IdProductoNavigation)

                    .ThenInclude(p =>
                        p.IdTiendaNavigation)

                .Where(i =>
                    i.IdProductoNavigation != null &&

                    i.IdProductoNavigation
                        .IdTiendaNavigation != null &&

                    i.IdProductoNavigation
                        .IdTiendaNavigation
                        .IdVendedor == idVendedor &&

                    i.StockActual <= i.StockMinimo)

                .OrderBy(i =>
                    i.StockActual)

                .ToListAsync();
        }
    }
}