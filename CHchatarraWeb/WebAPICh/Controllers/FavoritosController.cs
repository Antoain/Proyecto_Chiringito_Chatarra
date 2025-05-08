using ChiringuitoCH_Data.DAO;
using ChiringuitoCH_Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace WebAPICh.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoritosController : ControllerBase
    {
        private readonly FavoritosDAO _favoritosDAO;

        public FavoritosController(FavoritosDAO favoritoDAO)
        {
            _favoritosDAO = favoritoDAO;
        }

        [HttpGet("ObtenerFavorito/{idUsuario}")]
        public async Task<ActionResult<IEnumerable<Producto>>> ObtenerFavoritos(int idUsuario)
        {
            var favoritos = await _favoritosDAO.ObtenerFavoritosPorUsuario(idUsuario);

            var resultado = favoritos.Select(f => new
            {
                f.IdProducto,
                f.IdFavorito,
                Producto = f.IdProductoNavigation
            })
            .Distinct()
            .ToList();

            return Ok(resultado);
        }


        [HttpPost("Agregar")]
        public async Task<IActionResult> AgregarFavorito([FromBody] Favorito nuevoFavorito)
        {
            var existeFavorito = await _favoritosDAO.ExisteFavoritoAsync(nuevoFavorito.IdUsuario, nuevoFavorito.IdProducto);

            if (existeFavorito)
            {
                return BadRequest(new { mensaje = "Este producto ya está en favoritos." });
            }

            await _favoritosDAO.AgregarFavoritoAsync(nuevoFavorito);

            return Ok(new { mensaje = "Producto agregado a favoritos." });
        }



        [HttpDelete("Eliminar/{idFavorito}")]
        public async Task<IActionResult> EliminarFavorito(int idFavorito)
        {
            var resultado = await _favoritosDAO.EliminarFavorito(idFavorito);
            return resultado ? Ok(new { mensaje = "Producto eliminado de favoritos." }) : NotFound(new { mensaje = "No existe ese favorito." });
        }
    }
}
