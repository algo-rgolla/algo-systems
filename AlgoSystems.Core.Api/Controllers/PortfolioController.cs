using AlgoSystems.Application.Interfaces;
using AlgoSystems.BusinessObjects;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AlgoSystems.Core.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PortfolioController : ControllerBase
    {
        private readonly IEodhdPortfolioService _portfolioService;
        private readonly ILogger<PortfolioController> _logger;

        public PortfolioController(IEodhdPortfolioService portfolioService, ILogger<PortfolioController> logger)
        {
            _portfolioService = portfolioService ?? throw new ArgumentNullException(nameof(portfolioService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("portfolio-list")]
        public async Task<IActionResult> GetProductScanResult([FromQuery] PortfolioViewModel request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.ScanName))
            {
                _logger.LogWarning("Invalid PortfolioViewModel request received.");
                return BadRequest("Invalid request parameters.");
            }

            try
            {
                _logger.LogInformation("Fetching portfolio for scan: {ScanName}", request.ScanName);
                var products = await _portfolioService.GetAlgoPortfolio(request).ConfigureAwait(false);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching portfolio for scan: {ScanName}", request.ScanName);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("portfolio-statistics")]
        public async Task<IActionResult> GetPortfolioStatistics([FromQuery] StatisticsRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.ScanName))
            {
                _logger.LogWarning("Invalid StatisticsRequestDto request received.");
                return BadRequest("Invalid request parameters.");
            }

            try
            {
                _logger.LogInformation("Fetching portfolio statistics for scan: {ScanName}", request.ScanName);
                var statistics = await _portfolioService.GetPortfolioStatistics(request).ConfigureAwait(false);
                return Ok(statistics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching portfolio statistics for scan: {ScanName}", request.ScanName);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPost("create-portfolio")]
        public async Task<IActionResult> CreatePortfolio([FromBody] CreatePortfolioRequestDto request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Symbol))
            {
                _logger.LogWarning("Invalid CreatePortfolioRequestDto received.");
                return BadRequest("Invalid request parameters.");
            }

            try
            {
                var result = await _portfolioService.CreatePortfolioAsync(request).ConfigureAwait(false);

                if (result)
                {
                    return CreatedAtAction(nameof(GetProductScanResult), new { scanName = request.Symbol }, request);
                }

                return BadRequest("Failed to create portfolio.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating portfolio: {PortfolioName}", request.Symbol);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
    }
}