using AlgoSystems.Core.Portal.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class ShortScanController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult BearishTweezers()
        {
            var model = new ShortScanViewModel();

            return View("~/Views/LongScan/Index.cshtml");
        }

        public IActionResult BearishThrusting()
        {
            var model = new ShortScanViewModel();

            return View("~/Views/LongScan/Index.cshtml");
        }
        public IActionResult BearishEngulfing()
        {
            var model = new ShortScanViewModel();

            return View("~/Views/LongScan/Index.cshtml");
        }

    }
}
