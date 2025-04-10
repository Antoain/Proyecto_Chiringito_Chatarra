using Microsoft.AspNetCore.Mvc;

namespace CapaPresentacion.Controllers
{
    public class UsuarioController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
