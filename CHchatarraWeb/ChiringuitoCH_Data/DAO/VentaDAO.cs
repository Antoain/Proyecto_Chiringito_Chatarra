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
    public class VentaDAO
    {
        private readonly ChChatarra40Context _context;
        public VentaDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        
        public async Task<Ventum?> RealizarVenta(Ventum venta)
        {
            
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                
                _context.Venta.Add(venta);
                await _context.SaveChangesAsync();

                
                await transaction.CommitAsync();
                return venta;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                
                throw ex;
            }

        }

        // Método para obtener todas las ventas
        public async Task<List<Ventum>> ObtenerVentas()
        {
            return await _context.Venta
                .Include(v => v.DetalleVenta)
                .Include(v => v.IdDistritoNavigation)
                .Include(v => v.IdTiendaNavigation)
                .Include(v => v.IdUsuarioNavigation)
                .OrderByDescending(v => v.FechaVenta) 
                .ToListAsync();
        }


        public async Task<List<Ventum>> ObtenerVentasPorVendedorAsync(int idVendedor)
        {
            // Buscar todas las tiendas del vendedor
            var tiendasDelVendedor = await _context.Tiendas
                .Where(t => t.IdVendedor == idVendedor)
                .Select(t => t.IdTienda)
                .ToListAsync();

            // Obtener todas las ventas de esas tiendas
            return await _context.Venta
                .Where(v => tiendasDelVendedor.Contains(v.IdTienda))
                .Include(v => v.IdTiendaNavigation)  
                .Include(v => v.DetalleVenta)  
                .OrderByDescending(v => v.FechaVenta) 
                .ToListAsync();
        }
    }
}
