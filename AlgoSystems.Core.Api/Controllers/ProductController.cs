using AlgoSystems.Application.Interfaces;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ISearchService _searchService;

        public ProductController(ISearchService searchService)
        {
            _searchService = searchService;
        }

        [HttpGet("api/eodhd/products/{asxType?}")]
        public async Task<IActionResult> GetEodhdProducts(string? asxType = null)
        {
            var products = await _searchService.GetEodhdProducts(asxType);

            return Ok(products);
        }

        [HttpGet("api/eodhd/products/search")]
        public async Task<IActionResult> GetEodhdProducts([FromQuery] ProductSearchParameters searchParams)
        {
            var asxType = searchParams.AsxType ?? "asx20";
            var marketCap = searchParams.MarketCap;
            var code = searchParams.Code;

            var products = await _searchService.GetEodhdProducts(asxType);

            return Ok(products);
        }


    }

    public class ProductSearchParameters
    {
        public string? AsxType { get; set; }
        public decimal? MarketCap { get; set; }
        public string? Code { get; set; }
    }
}
