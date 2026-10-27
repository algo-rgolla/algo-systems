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

        /// <summary>The results of one scan, newest first. An unknown scan returns no products.</summary>
        [HttpGet("api/longscan/get-scan-result")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ProductsViewModel>> GetProductScanResult([FromQuery] LongScanViewModel request, CancellationToken cancellationToken)
        {
            return await _productScanService.GetScanResultsAsync(request.ScanName, cancellationToken);
        }

        /// <summary>The number of results for each catalogued scan.</summary>
        [HttpGet("api/longscan/scan-counters")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<ScanCounterListDto>> GetScanCounters(CancellationToken cancellationToken)
        {
            return await _productScanService.GetScanCountersAsync(cancellationToken);
        }
    }
}
