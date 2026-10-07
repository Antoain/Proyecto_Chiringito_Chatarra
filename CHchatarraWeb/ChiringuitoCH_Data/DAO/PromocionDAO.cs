using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class PromocionDAO
    {
        private readonly ChChatarra40Context _context;

        public PromocionDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // PROMOCIONES DEL VENDEDOR
        // ==========================================

        public async Task<List<Promocione>>
            ObtenerPromocionesPorVendedorAsync(
                int idVendedor)
        {
            return await _context.Promociones

                .Include(p =>
                    p.IdProductoNavigation)

                .ThenInclude(p =>
                    p!.IdTiendaNavigation)

                .Where(p =>
                    p.IdProductoNavigation != null &&
                    p.IdProductoNavigation
                        .IdTiendaNavigation != null &&
                    p.IdProductoNavigation
                        .IdTiendaNavigation!
                        .IdVendedor == idVendedor)

                .OrderByDescending(p =>
                    p.FechaInicio)

                .ThenByDescending(p =>
                    p.IdPromocion)

                .ToListAsync();
        }


        // ==========================================
        // PROMOCIÓN POR ID
        // ==========================================

        public async Task<Promocione?>
            ObtenerPorIdAsync(
                int idPromocion)
        {
            return await _context.Promociones

                .Include(p =>
                    p.IdProductoNavigation)

                .ThenInclude(p =>
                    p!.IdTiendaNavigation)

                .FirstOrDefaultAsync(p =>
                    p.IdPromocion ==
                    idPromocion);
        }


        // ==========================================
        // PROMOCIÓN ACTIVA DE PRODUCTO
        // ==========================================

        public async Task<Promocione?>
            ObtenerPromocionActivaProductoAsync(
                int idProducto)
        {
            var hoy =
                DateOnly.FromDateTime(
                    DateTime.Now
                );


            return await _context.Promociones

                .Where(p =>
                    p.IdProducto ==
                        idProducto &&

                    p.Descuento != null &&

                    p.Descuento > 0 &&

                    p.FechaInicio != null &&

                    p.FechaFin != null &&

                    p.FechaInicio <= hoy &&

                    p.FechaFin >= hoy)

                .OrderByDescending(p =>
                    p.Descuento)

                .ThenByDescending(p =>
                    p.FechaInicio)

                .FirstOrDefaultAsync();
        }


        // ==========================================
        // VALIDAR SOLAPAMIENTO
        // ==========================================

        public async Task<bool>
            ExistePromocionSolapadaAsync(
                int idProducto,
                DateOnly fechaInicio,
                DateOnly fechaFin,
                int? excluirIdPromocion = null)
        {
            var query =
                _context.Promociones
                    .Where(p =>
                        p.IdProducto ==
                            idProducto &&

                        p.FechaInicio != null &&

                        p.FechaFin != null &&

                        p.FechaInicio <=
                            fechaFin &&

                        p.FechaFin >=
                            fechaInicio);


            if (excluirIdPromocion.HasValue)
            {
                query =
                    query.Where(p =>
                        p.IdPromocion !=
                        excluirIdPromocion.Value);
            }


            return await query.AnyAsync();
        }


        // ==========================================
        // CREAR
        // ==========================================

        public async Task CrearAsync(
            Promocione promocion)
        {
            _context.Promociones.Add(
                promocion
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ACTUALIZAR
        // ==========================================

        public async Task ActualizarAsync(
            Promocione promocion)
        {
            _context.Promociones.Update(
                promocion
            );

            await _context.SaveChangesAsync();
        }


        // ==========================================
        // ELIMINAR
        // ==========================================

        public async Task EliminarAsync(
            Promocione promocion)
        {
            _context.Promociones.Remove(
                promocion
            );

            await _context.SaveChangesAsync();
        }

        // ==========================================
        // TODAS LAS PROMOCIONES ACTIVAS
        // ==========================================

        public async Task<List<Promocione>>
            ObtenerPromocionesActivasAsync()
        {
            var hoy =
                DateOnly.FromDateTime(
                    DateTime.Now
                );


            return await _context.Promociones

                .Include(p =>
                    p.IdProductoNavigation)

                .Where(p =>
                    p.IdProducto != null &&

                    p.IdProductoNavigation != null &&

                    p.IdProductoNavigation.Activo == true &&

                    p.Descuento != null &&

                    p.Descuento > 0 &&

                    p.FechaInicio != null &&

                    p.FechaFin != null &&

                    p.FechaInicio <= hoy &&

                    p.FechaFin >= hoy
                )

                .OrderBy(p =>
                    p.IdProducto)

                .ThenByDescending(p =>
                    p.Descuento)

                .ToListAsync();
        }
    }
}