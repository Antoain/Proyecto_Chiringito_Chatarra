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
    public class PromocionController : ControllerBase
    {
        private readonly PromocionDAO _promocionDAO;
        private readonly ProductosDAO _productoDAO;


        public PromocionController(
            PromocionDAO promocionDAO,
            ProductosDAO productoDAO)
        {
            _promocionDAO =
                promocionDAO;

            _productoDAO =
                productoDAO;
        }


        // ==========================================
        // MIS PROMOCIONES
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpGet("MisPromociones")]
        public async Task<IActionResult>
            MisPromociones()
        {
            if (!ObtenerIdUsuario(
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var promociones =
                await _promocionDAO
                    .ObtenerPromocionesPorVendedorAsync(
                        idVendedor
                    );


            var hoy =
                DateOnly.FromDateTime(
                    DateTime.Now
                );


            var resultado =
                promociones.Select(p =>
                {
                    string estado;


                    if (
                        p.FechaInicio.HasValue &&
                        p.FechaInicio.Value > hoy)
                    {
                        estado =
                            "PROGRAMADA";
                    }
                    else if (
                        p.FechaFin.HasValue &&
                        p.FechaFin.Value < hoy)
                    {
                        estado =
                            "FINALIZADA";
                    }
                    else
                    {
                        estado =
                            "ACTIVA";
                    }


                    decimal precio =
                        p.IdProductoNavigation
                            ?.Precio ?? 0m;


                    decimal descuento =
                        p.Descuento ?? 0m;


                    decimal precioFinal =
                        Math.Round(
                            precio *
                            (
                                1m -
                                descuento /
                                100m
                            ),
                            2
                        );


                    return new
                    {
                        p.IdPromocion,

                        p.IdProducto,

                        Producto =
                            p.IdProductoNavigation
                                ?.Nombre ??
                            "Producto no disponible",

                        IdTienda =
                            p.IdProductoNavigation
                                ?.IdTienda,

                        Tienda =
                            p.IdProductoNavigation
                                ?.IdTiendaNavigation
                                ?.NombreNegocio ??
                            "Tienda no disponible",

                        p.Titulo,

                        p.Descripcion,

                        Descuento =
                            descuento,

                        p.FechaInicio,

                        p.FechaFin,

                        Estado =
                            estado,

                        PrecioOriginal =
                            precio,

                        PrecioFinal =
                            precioFinal
                    };
                })
                .ToList();


            return Ok(resultado);
        }


        // ==========================================
        // PROMOCIÓN ACTIVA PÚBLICA
        // ==========================================

        [HttpGet("ActivaProducto/{idProducto}")]
        public async Task<IActionResult>
            ActivaProducto(
                int idProducto)
        {
            if (idProducto <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El producto no es válido."
                });
            }


            var producto =
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        idProducto
                    );


            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El producto no existe."
                });
            }


            var promocion =
                await _promocionDAO
                    .ObtenerPromocionActivaProductoAsync(
                        idProducto
                    );


            if (promocion == null)
            {
                return Ok(new
                {
                    tienePromocion =
                        false,

                    descuento =
                        0m,

                    precioOriginal =
                        producto.Precio,

                    precioFinal =
                        producto.Precio
                });
            }


            decimal descuento =
                promocion.Descuento ??
                0m;


            decimal precioFinal =
                Math.Round(
                    producto.Precio *
                    (
                        1m -
                        descuento /
                        100m
                    ),
                    2
                );


            return Ok(new
            {
                tienePromocion =
                    true,

                promocion.IdPromocion,

                promocion.Titulo,

                promocion.Descripcion,

                descuento,

                promocion.FechaInicio,

                promocion.FechaFin,

                precioOriginal =
                    producto.Precio,

                precioFinal
            });
        }


        // ==========================================
        // CREAR PROMOCIÓN
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPost]
        public async Task<IActionResult>
            Crear(
                [FromBody]
                CrearPromocionRequest request)
        {
            if (!ObtenerIdUsuario(
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            if (request == null ||
                request.IdProducto <= 0)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Los datos enviados no son válidos."
                });
            }


            if (string.IsNullOrWhiteSpace(
                request.Titulo))
            {
                return BadRequest(new
                {
                    mensaje =
                        "El título es obligatorio."
                });
            }


            if (
                request.Descuento <= 0 ||
                request.Descuento > 100)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El descuento debe ser mayor que 0 y menor o igual a 100."
                });
            }


            if (
                request.FechaFin <
                request.FechaInicio)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La fecha final no puede ser anterior a la fecha de inicio."
                });
            }


            var producto =
                await _productoDAO
                    .ObtenerProductoPorIdAsync(
                        request.IdProducto
                    );


            if (producto == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "El producto no existe."
                });
            }


            var vendedorProducto =
                await _productoDAO
                    .ObtenerVendedorPorProductoAsync(
                        request.IdProducto
                    );


            if (
                vendedorProducto == null ||
                vendedorProducto.IdUsuario !=
                    idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para crear promociones para este producto."
                });
            }


            bool solapada =
                await _promocionDAO
                    .ExistePromocionSolapadaAsync(
                        request.IdProducto,
                        request.FechaInicio,
                        request.FechaFin
                    );


            if (solapada)
            {
                return BadRequest(new
                {
                    mensaje =
                        "Ya existe una promoción para ese producto dentro del rango de fechas seleccionado."
                });
            }


            var promocion =
                new Promocione
                {
                    IdProducto =
                        request.IdProducto,

                    IdTienda =
                        null,

                    IdEvento =
                        null,

                    Titulo =
                        request.Titulo.Trim(),

                    Descripcion =
                        string.IsNullOrWhiteSpace(
                            request.Descripcion
                        )
                            ? null
                            : request
                                .Descripcion
                                .Trim(),

                    Descuento =
                        request.Descuento,

                    FechaInicio =
                        request.FechaInicio,

                    FechaFin =
                        request.FechaFin
                };


            await _promocionDAO
                .CrearAsync(
                    promocion
                );


            return Ok(new
            {
                mensaje =
                    "Promoción creada correctamente.",

                promocion.IdPromocion
            });
        }


        // ==========================================
        // EDITAR PROMOCIÓN
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpPut("{idPromocion}")]
        public async Task<IActionResult>
            Editar(
                int idPromocion,
                [FromBody]
                EditarPromocionRequest request)
        {
            if (!ObtenerIdUsuario(
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var promocion =
                await _promocionDAO
                    .ObtenerPorIdAsync(
                        idPromocion
                    );


            if (promocion == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "La promoción no existe."
                });
            }


            if (
                promocion
                    .IdProductoNavigation
                    ?.IdTiendaNavigation
                    ?.IdVendedor !=
                idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para editar esta promoción."
                });
            }


            if (string.IsNullOrWhiteSpace(
                request.Titulo))
            {
                return BadRequest(new
                {
                    mensaje =
                        "El título es obligatorio."
                });
            }


            if (
                request.Descuento <= 0 ||
                request.Descuento > 100)
            {
                return BadRequest(new
                {
                    mensaje =
                        "El descuento debe estar entre 0 y 100."
                });
            }


            if (
                request.FechaFin <
                request.FechaInicio)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La fecha final no puede ser anterior a la fecha inicial."
                });
            }


            if (!promocion.IdProducto.HasValue)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La promoción no está asociada a un producto."
                });
            }


            bool solapada =
                await _promocionDAO
                    .ExistePromocionSolapadaAsync(
                        promocion
                            .IdProducto
                            .Value,

                        request.FechaInicio,

                        request.FechaFin,

                        promocion
                            .IdPromocion
                    );


            if (solapada)
            {
                return BadRequest(new
                {
                    mensaje =
                        "La promoción se cruza con otra promoción existente para este producto."
                });
            }


            promocion.Titulo =
                request.Titulo.Trim();


            promocion.Descripcion =
                string.IsNullOrWhiteSpace(
                    request.Descripcion
                )
                    ? null
                    : request
                        .Descripcion
                        .Trim();


            promocion.Descuento =
                request.Descuento;


            promocion.FechaInicio =
                request.FechaInicio;


            promocion.FechaFin =
                request.FechaFin;


            await _promocionDAO
                .ActualizarAsync(
                    promocion
                );


            return Ok(new
            {
                mensaje =
                    "Promoción actualizada correctamente."
            });
        }


        // ==========================================
        // ELIMINAR PROMOCIÓN
        // ==========================================

        [Authorize(Roles = "Vendedor")]
        [HttpDelete("{idPromocion}")]
        public async Task<IActionResult>
            Eliminar(
                int idPromocion)
        {
            if (!ObtenerIdUsuario(
                out int idVendedor))
            {
                return Unauthorized(new
                {
                    mensaje =
                        "No se pudo identificar al vendedor."
                });
            }


            var promocion =
                await _promocionDAO
                    .ObtenerPorIdAsync(
                        idPromocion
                    );


            if (promocion == null)
            {
                return NotFound(new
                {
                    mensaje =
                        "La promoción no existe."
                });
            }


            if (
                promocion
                    .IdProductoNavigation
                    ?.IdTiendaNavigation
                    ?.IdVendedor !=
                idVendedor)
            {
                return StatusCode(403, new
                {
                    mensaje =
                        "No tiene permiso para eliminar esta promoción."
                });
            }


            await _promocionDAO
                .EliminarAsync(
                    promocion
                );


            return NoContent();
        }


        // ==========================================
        // ID USUARIO
        // ==========================================

        private bool ObtenerIdUsuario(
            out int idUsuario)
        {
            var claim =
                User.FindFirst(
                    ClaimTypes
                        .NameIdentifier
                )
                ?.Value;


            return int.TryParse(
                claim,
                out idUsuario
            );
        }

        // ==========================================
        // TODAS LAS PROMOCIONES ACTIVAS - PÚBLICO
        // ==========================================

        [AllowAnonymous]
        [HttpGet("Activas")]
        public async Task<IActionResult>
            ObtenerActivas()
        {
            var promociones =
                await _promocionDAO
                    .ObtenerPromocionesActivasAsync();


            var resultado =
                promociones

                    .GroupBy(p =>
                        p.IdProducto)

                    .Select(grupo =>
                        grupo
                            .OrderByDescending(p =>
                                p.Descuento)
                            .First()
                    )

                    .Select(p =>
                    {
                        decimal precioOriginal =
                            p.IdProductoNavigation
                                ?.Precio ?? 0m;


                        decimal descuento =
                            p.Descuento ?? 0m;


                        decimal precioFinal =
                            Math.Round(
                                precioOriginal *
                                (
                                    1m -
                                    descuento /
                                    100m
                                ),
                                2
                            );


                        return new
                        {
                            p.IdPromocion,

                            p.IdProducto,

                            p.Titulo,

                            p.Descripcion,

                            Descuento =
                                descuento,

                            p.FechaInicio,

                            p.FechaFin,

                            PrecioOriginal =
                                precioOriginal,

                            PrecioFinal =
                                precioFinal
                        };
                    })

                    .ToList();


            return Ok(resultado);
        }
    }
}