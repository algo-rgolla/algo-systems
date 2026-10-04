using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace AlgoSystems.Core.Portal.Controllers
{
    //[Authorize(Roles = "Admin")]
    public class MarketController : Controller
    {
        public IActionResult Indices()
        {
            return View();
        }
        public IActionResult Commodities()
        {
            return View();
        }
    }
}
