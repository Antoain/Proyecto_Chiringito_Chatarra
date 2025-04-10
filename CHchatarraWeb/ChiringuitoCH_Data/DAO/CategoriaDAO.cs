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
    public class CategoriaDAO
    {
        private readonly ChChatarra40Context _context;

        public CategoriaDAO(ChChatarra40Context context)
        {
            _context = context;
        }

        // Obtener todas las categorías
        public async Task<IEnumerable<Categorium>> ObtenerCategoriasAsync()
        {
            return await _context.Categoria.ToListAsync();
        }

        // Obtener una categoría por ID
        public async Task<Categorium> ObtenerCategoriaPorIdAsync(int id)
        {
            return await _context.Categoria.FindAsync(id);
        }

        // Crear una nueva categoría
        public async Task CrearCategoriaAsync(Categorium categorium)
        {
            _context.Categoria.Add(categorium);
            await _context.SaveChangesAsync();
        }

        // Actualizar una categoría
        public async Task ActualizarCategoriaAsync(Categorium categorium)
        {
            _context.Entry(categorium).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        // Eliminar una categoría por ID
        public async Task EliminarCategoriaAsync(int id)
        {
            var categorium = await _context.Categoria.FindAsync(id);
            if (categorium != null)
            {
                _context.Categoria.Remove(categorium);
                await _context.SaveChangesAsync();
            }
        }
    }
}
