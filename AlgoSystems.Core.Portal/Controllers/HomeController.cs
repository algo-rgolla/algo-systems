using AlgoSystems.Core.Portal.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace AlgoSystems.Core.Portal.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> logger;

        public HomeController(ILogger<HomeController> logger)
        {
            this.logger = logger;
        }

        public IActionResult Main()
        {
            logger.LogInformation("This is Info from HomeController ");
            logger.LogError("This is Error from HomeController ");

            return View();
        }

        public IActionResult Minor()
        {

            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}