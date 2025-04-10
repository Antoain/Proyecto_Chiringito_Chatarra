using Microsoft.AspNetCore.Mvc;

namespace CapaPresentacion.Controllers
{
    public class VendedorController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
