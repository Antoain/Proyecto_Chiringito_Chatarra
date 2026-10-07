using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.DTOs;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReseniaProductoController
        : ControllerBase
    {
        private readonly
            RenseniaProductoDAO
            _resenasDao;

        private readonly
            ProductosDAO
            _productoDAO;


        public ReseniaProductoController(
            RenseniaProductoDAO resenasDao,
            ProductosDAO productoDAO)
        {
            _resenasDao =
                resenasDao;

            _productoDAO =
                productoDAO;
        }


        // ==========================================
        // OBTENER RESEÑAS - PÚBLICO
        // ==========================================

        [AllowAnonymous]
        [HttpGet(
            "ObtenerResenas/{idProducto}")]
        public async Task<IActionResult>
            ObtenerResenas(
                int idProducto)
        {
            if (idProducto <= 0)
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "El identificador del producto no es válido."
                    }
                );
            }


            var resenas =
                await _resenasDao
                    .ObtenerResenasDTOPorProducto(
                        idProducto
                    );


            if (
                resenas == null ||
                !resenas.Any()
            )
            {
                return NotFound(
                    new
                    {
                        mensaje =
                            "No se encontraron reseñas para este producto."
                    }
                );
            }


            return Ok(
                resenas
            );
        }


        // ==========================================
        // AGREGAR RESEÑA - CLIENTE
        // ==========================================

        [Authorize(
            Roles = "Cliente"
        )]
        [HttpPost("Agregar")]
        public async Task<IActionResult>
            AgregarResena(
                [FromBody]
                AgregarResenaRequest request)
        {
            if (
                request == null ||
                request.IdProducto <= 0
            )
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "Datos inválidos."
                    }
                );
            }


            // ======================================
            // VALIDAR CALIFICACIÓN
            // ======================================

            if (
                request.Calificacion < 1 ||
                request.Calificacion > 5
            )
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "La calificación debe estar entre 1 y 5."
                    }
                );
            }


            // ======================================
            // VALIDAR COMENTARIO
            // ======================================

            var comentario =
                request.Comentario
                    ?.Trim();


            if (
                string.IsNullOrWhiteSpace(
                    comentario
                )
            )
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "Debes escribir un comentario."
                    }
                );
            }


            if (
                comentario.Length > 1000
            )
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "El comentario no puede superar los 1000 caracteres."
                    }
                );
            }


            // ======================================
            // OBTENER USUARIO DESDE JWT
            // ======================================

            var idUsuarioClaim =
                User.FindFirst(
                    ClaimTypes
                        .NameIdentifier
                )?.Value;


            if (
                !int.TryParse(
                    idUsuarioClaim,
                    out int idUsuario
                )
            )
            {
                return Unauthorized(
                    new
                    {
                        mensaje =
                            "No se pudo identificar al usuario."
                    }
                );
            }


            // ======================================
            // VALIDAR PRODUCTO
            // ======================================

            var producto =
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        request.IdProducto
                    );


            if (producto == null)
            {
                return NotFound(
                    new
                    {
                        mensaje =
                            "El producto no existe."
                    }
                );
            }


            // ======================================
            // VALIDAR COMPRA ENTREGADA
            // ======================================

            var puedeResenar =
                await _resenasDao
                    .ClientePuedeResenarProductoAsync(
                        idUsuario,
                        request.IdProducto
                    );


            if (!puedeResenar)
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "Solo puedes reseñar productos que hayas comprado y recibido."
                    }
                );
            }


            // ======================================
            // EVITAR RESEÑAS DUPLICADAS
            // ======================================

            var yaExiste =
                await _resenasDao
                    .ExisteResenaUsuarioProductoAsync(
                        idUsuario,
                        request.IdProducto
                    );


            if (yaExiste)
            {
                return Conflict(
                    new
                    {
                        mensaje =
                            "Ya has publicado una reseña para este producto."
                    }
                );
            }


            // ======================================
            // CREAR RESEÑA
            // ======================================

            var resena =
                new ResenasProducto
                {
                    IdUsuario =
                        idUsuario,

                    IdProducto =
                        request.IdProducto,

                    Calificacion =
                        request.Calificacion,

                    Comentario =
                        comentario
                };


            var resultado =
                await _resenasDao
                    .AgregarResena(
                        resena
                    );


            if (!resultado)
            {
                return BadRequest(
                    new
                    {
                        mensaje =
                            "No se pudo agregar la reseña."
                    }
                );
            }


            return Ok(
                new
                {
                    mensaje =
                        "Reseña agregada correctamente."
                }
            );
        }
    }
}