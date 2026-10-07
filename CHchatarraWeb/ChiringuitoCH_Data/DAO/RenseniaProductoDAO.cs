using ChiringuitoCH_Data.Context;
using ChiringuitoCH_Data.Models;
using Microsoft.EntityFrameworkCore;

namespace ChiringuitoCH_Data.DAO
{
    public class RenseniaProductoDAO
    {
        private readonly ChChatarra40Context _context;


        public RenseniaProductoDAO(
            ChChatarra40Context context)
        {
            _context = context;
        }


        // ==========================================
        // OBTENER RESEÑAS DE UN PRODUCTO
        // ==========================================

        public async Task<List<ResenasProducto>>
            ObtenerResenasPorProducto(
                int idProducto)
        {
            return await _context
                .ResenasProductos

                .Where(r =>
                    r.IdProducto ==
                    idProducto)

                .Include(r =>
                    r.IdUsuarioNavigation)

                .OrderByDescending(r =>
                    r.IdResena)

                .ToListAsync();
        }


        // ==========================================
        // OBTENER RESEÑAS DTO
        // ==========================================

        public async Task<List<object>>
            ObtenerResenasDTOPorProducto(
                int idProducto)
        {
            var resenas =
                await _context
                    .ResenasProductos

                    .Where(r =>
                        r.IdProducto ==
                        idProducto)

                    .Include(r =>
                        r.IdUsuarioNavigation)

                    .OrderByDescending(r =>
                        r.IdResena)

                    .Select(r => new
                    {
                        idResena =
                            r.IdResena,

                        calificacion =
                            r.Calificacion,

                        comentario =
                            r.Comentario,

                        usuario =
                            r.IdUsuarioNavigation != null
                                ? r.IdUsuarioNavigation.Nombres
                                : "Usuario"
                    })

                    .ToListAsync();


            return resenas
                .Cast<object>()
                .ToList();
        }


        // ==========================================
        // EXISTE RESEÑA DEL USUARIO
        // ==========================================

        public async Task<bool>
            ExisteResenaUsuarioProductoAsync(
                int idUsuario,
                int idProducto)
        {
            return await _context
                .ResenasProductos
                .AnyAsync(r =>
                    r.IdUsuario ==
                    idUsuario &&
                    r.IdProducto ==
                    idProducto
                );
        }


        // ==========================================
        // CLIENTE COMPRÓ Y RECIBIÓ PRODUCTO
        // ==========================================

        public async Task<bool>
            ClientePuedeResenarProductoAsync(
                int idUsuario,
                int idProducto)
        {
            return await _context
                .DetalleSubPedidos

                .AnyAsync(detalle =>

                    detalle.IdProducto ==
                    idProducto &&

                    detalle
                        .IdSubPedidoNavigation !=
                        null &&

                    detalle
                        .IdSubPedidoNavigation
                        .Estado ==
                        "ENTREGADO" &&

                    detalle
                        .IdSubPedidoNavigation
                        .IdPedidoNavigation !=
                        null &&

                    detalle
                        .IdSubPedidoNavigation
                        .IdPedidoNavigation
                        .IdUsuario ==
                        idUsuario
                );
        }


        // ==========================================
        // AGREGAR RESEÑA
        // ==========================================

        public async Task<bool>
            AgregarResena(
                ResenasProducto resena)
        {
            var productoExiste =
                await _context
                    .Productos
                    .AnyAsync(p =>
                        p.IdProducto ==
                        resena.IdProducto
                    );


            if (!productoExiste)
            {
                return false;
            }


            await _context
                .ResenasProductos
                .AddAsync(
                    resena
                );


            await _context
                .SaveChangesAsync();


            return true;
        }
    }
}