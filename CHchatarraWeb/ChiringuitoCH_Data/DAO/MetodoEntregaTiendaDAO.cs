using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class MetodoEntregaTiendaDAO
    {
        private readonly ChChatarra40Context _context;

        public MetodoEntregaTiendaDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER MÉTODOS DEL VENDEDOR
        // ==========================================

        public async Task<List<MetodoEntregaTienda>>
            ObtenerPorVendedorAsync(int idVendedor)
        {
            return await _context.MetodosEntregaTienda

                .Include(m =>
                    m.IdTiendaNavigation)

                .Where(m =>
                    m.IdTiendaNavigation != null &&
                    m.IdTiendaNavigation.IdVendedor
                        == idVendedor)

                .OrderBy(m => m.IdTienda)
                .ThenBy(m => m.TipoMetodo)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER MÉTODO POR ID
        // ==========================================

        public async Task<MetodoEntregaTienda?>
            ObtenerPorIdAsync(int idMetodoEntrega)
        {
            return await _context.MetodosEntregaTienda

                .Include(m =>
                    m.IdTiendaNavigation)

                .FirstOrDefaultAsync(m =>
                    m.IdMetodoEntrega ==
                    idMetodoEntrega);
        }


        // ==========================================
        // VALIDAR PROPIEDAD DE TIENDA
        // ==========================================

        public async Task<bool>
            TiendaPerteneceAVendedorAsync(
                int idTienda,
                int idVendedor)
        {
            return await _context.Tiendas
                .AnyAsync(t =>
                    t.IdTienda == idTienda &&
                    t.IdVendedor == idVendedor);
        }


        // ==========================================
        // VALIDAR SI YA EXISTE EL MÉTODO
        // ==========================================

        public async Task<bool>
            ExisteMetodoAsync(
                int idTienda,
                string tipoMetodo)
        {
            return await _context
                .MetodosEntregaTienda
                .AnyAsync(m =>
                    m.IdTienda == idTienda &&
                    m.TipoMetodo == tipoMetodo);
        }


        // ==========================================
        // CREAR
        // ==========================================

        public async Task CrearAsync(
            MetodoEntregaTienda metodo)
        {
            _context.MetodosEntregaTienda
                .Add(metodo);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        public async Task ActualizarAsync(
            MetodoEntregaTienda metodo)
        {
            _context.MetodosEntregaTienda
                .Update(metodo);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ELIMINAR
        // ==========================================

        public async Task EliminarAsync(
            MetodoEntregaTienda metodo)
        {
            _context.MetodosEntregaTienda
                .Remove(metodo);

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // OBTENER MÉTODOS ACTIVOS DE UNA TIENDA
        // PARA CHECKOUT MÁS ADELANTE
        // ==========================================

        public async Task<List<MetodoEntregaTienda>>
            ObtenerActivosPorTiendaAsync(
                int idTienda)
        {
            return await _context
                .MetodosEntregaTienda

                .Where(m =>
                    m.IdTienda == idTienda &&
                    m.Activo)

                .OrderBy(m => m.TipoMetodo)

                .ToListAsync();
        }


        // ==========================================
        // VALIDAR MÉTODO ACTIVO
        // ==========================================

        public async Task<MetodoEntregaTienda?>
            ObtenerMetodoActivoAsync(
                int idTienda,
                string tipoMetodo)
        {
            return await _context
                .MetodosEntregaTienda

                .FirstOrDefaultAsync(m =>
                    m.IdTienda == idTienda &&
                    m.TipoMetodo == tipoMetodo &&
                    m.Activo);
        }
    }
}