using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class CoberturaTiendaDAO
    {
        private readonly ChChatarra40Context _context;

        public CoberturaTiendaDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // Coberturas de todas las tiendas pertenecientes al vendedor
        public async Task<List<CoberturaTienda>>
            ObtenerPorVendedorAsync(int idVendedor)
        {
            return await _context.CoberturasTienda
                .Include(c => c.IdTiendaNavigation)
                .Include(c => c.IdDistritoNavigation)
                .Where(c =>
                    c.IdTiendaNavigation != null &&
                    c.IdTiendaNavigation.IdVendedor == idVendedor)
                .OrderBy(c => c.IdTienda)
                .ThenBy(c => c.IdDistrito)
                .ToListAsync();
        }

        // Buscar una cobertura específica
        public async Task<CoberturaTienda?>
            ObtenerPorIdAsync(int idCobertura)
        {
            return await _context.CoberturasTienda
                .Include(c => c.IdTiendaNavigation)
                .Include(c => c.IdDistritoNavigation)
                .FirstOrDefaultAsync(c =>
                    c.IdCobertura == idCobertura);
        }

        // Verificar si la tienda pertenece al vendedor
        public async Task<bool> TiendaPerteneceAVendedorAsync(
            int idTienda,
            int idVendedor)
        {
            return await _context.Tiendas
                .AnyAsync(t =>
                    t.IdTienda == idTienda &&
                    t.IdVendedor == idVendedor);
        }

        // Verificar distrito
        public async Task<bool> ExisteDistritoAsync(int idDistrito)
        {
            return await _context.Distritos
                .AnyAsync(d =>
                    d.IdDistrito == idDistrito);
        }

        // Evitar cobertura duplicada
        public async Task<bool> ExisteCoberturaAsync(
            int idTienda,
            int idDistrito)
        {
            return await _context.CoberturasTienda
                .AnyAsync(c =>
                    c.IdTienda == idTienda &&
                    c.IdDistrito == idDistrito);
        }

        public async Task CrearAsync(CoberturaTienda cobertura)
        {
            _context.CoberturasTienda.Add(cobertura);
            await _context.SaveChangesAsync();
        }

        public async Task ActualizarAsync(CoberturaTienda cobertura)
        {
            _context.CoberturasTienda.Update(cobertura);
            await _context.SaveChangesAsync();
        }

        public async Task EliminarAsync(CoberturaTienda cobertura)
        {
            _context.CoberturasTienda.Remove(cobertura);
            await _context.SaveChangesAsync();
        }

        public async Task<CoberturaTienda?> ObtenerCoberturaActivaAsync(
        int idTienda,
        int idDistrito)
        {
            return await _context.CoberturasTienda
                .FirstOrDefaultAsync(c =>
                    c.IdTienda == idTienda &&
                    c.IdDistrito == idDistrito &&
                    c.Activo);
        }
    }
}