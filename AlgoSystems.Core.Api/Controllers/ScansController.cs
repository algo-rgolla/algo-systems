using AlgoSystems.Application.ProductScans;
using BusinessObjects;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class ScansController : ControllerBase
    {
        private readonly ProductScanService _productScanService;

        public ScansController(ProductScanService productScanService)
        {
            _productScanService = productScanService;
        }

        [HttpGet("api/longscan/get-scan-result")]
        public async Task<IActionResult> GetProductScanResult([FromQuery] LongScanViewModel request, CancellationToken cancellationToken)
        {
            var products = await _productScanService.GetScanResultsAsync(request.ScanName, cancellationToken);

            return Ok(products);
        }

        [HttpGet("api/longscan/scan-counters")]
        public async Task<IActionResult> GetScanCounters(CancellationToken cancellationToken)
        {
            var counters = await _productScanService.GetScanCountersAsync(cancellationToken);

            return Ok(counters);
        }
    }
}
