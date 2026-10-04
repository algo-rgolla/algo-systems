using AlgoSystems.Application.Interfaces;
using BusinessObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class SectorController : Controller
    {
        private readonly IProductService _productService;

        public SectorController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public IActionResult Index()
        {
            ViewBag.Message = "ASX Sectors Performance";
            return View();
        }

        [HttpGet]
        public ActionResult ProductCharts(string sectorCode)
        {
            var viewModel = _productService.GetProductsBySector(sectorCode);
            viewModel.ProductViewType = "SectorAnalysis";

            return View(viewModel);
        }
    }
}
