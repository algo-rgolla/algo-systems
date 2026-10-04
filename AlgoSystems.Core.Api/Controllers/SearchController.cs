using AlgoSystems.Application.Interfaces;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchBusinessLogic _searchBusinessLogic;

        public SearchController(ISearchBusinessLogic searchBusinessLogic)
        {
            _searchBusinessLogic = searchBusinessLogic;
        }

        [HttpGet("api/eodhd/products/search-product")]
        public async Task<IActionResult> GetProductScanResult([FromQuery] SearchViewModel request)
        {
            var products = await _searchBusinessLogic.SearchProductAsync(request);

            return Ok(products);
        }


    }
}
