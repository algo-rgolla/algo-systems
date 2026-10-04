using AlgoSystems.Application.Interfaces;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class LongScanController : ControllerBase
    {
        private readonly IScanBusinessLogic _scanBusinessLogic;

        public LongScanController(IScanBusinessLogic scanBusinessLogic)
        {
            _scanBusinessLogic = scanBusinessLogic;
        }

        [HttpGet("api/longscan/get-scan-result")]
        public async Task<IActionResult> GetProductScanResult([FromQuery] LongScanViewModel request)
        {
            var products = await _scanBusinessLogic.GetProductScanResultAsync(request);

            return Ok(products);
        }

        [HttpGet("api/longscan/scan-counters")]
        public async Task<IActionResult> GetScanCounters()
        {
            var products = await _scanBusinessLogic.GetScanCounters();

            return Ok(products);
        }

        //var userId = HttpContext.Items["UserId"]?.ToString();
        //var email = HttpContext.Items["Email"]?.ToString();

        // You can now log the user or use their ID/email
        //Console.WriteLine($"Request made by user: {userId}, email: {email}");

    }
}
