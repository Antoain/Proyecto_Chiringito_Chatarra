using Microsoft.AspNetCore.Mvc;

namespace CapaPresentacion.Controllers
{
    public class AdministradorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
