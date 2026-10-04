using AlgoSystems.Core.Portal.Options;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class DashboardController : Controller
    {
        private readonly IConfiguration _configuration;
        public DashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }
        public IActionResult Index()
        {
            return View();
        }
    }
}
