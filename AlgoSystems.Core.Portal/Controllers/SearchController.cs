using AlgoSystems.Application.Interfaces;
using AlgoSystems.Core.Portal.Models;
using BusinessObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class SearchController : Controller
    {
        private readonly ISearchService _searchService;

        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        public async Task<IActionResult> Index()
        {
            var products = await _searchService.GetProductsAsync();
            products = products.Where(x => x.MarketCap > 200000000).ToList();
            var model = new SearchViewModel();
            
            var productList = products.Select(x => new ProductViewModel
            {
                Symbol = x.Symbol,
                Name = x.Name,
                ClosePrice = x.Close != null ? x.Close.ToString() : string.Empty,
                Close = x.Close.ToString(),
                Change = x.Change.ToString(),
                MarketCap = x.MarketCap != null ? x.MarketCap.ToString() : string.Empty,
            }).ToList();
            model.Products = productList;

            return View(model);
        }
    }
}
