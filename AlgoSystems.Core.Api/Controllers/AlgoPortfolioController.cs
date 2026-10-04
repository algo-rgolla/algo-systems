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
    public class AlgoPortfolioController : ControllerBase
    {
        private readonly IEodhdPortfolioService _portfolioService;
        private readonly ILogger<PortfolioController> _logger;

        public AlgoPortfolioController(IEodhdPortfolioService portfolioService, ILogger<PortfolioController> logger)
        {
            _portfolioService = portfolioService ?? throw new ArgumentNullException(nameof(portfolioService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpGet("algo-portfolio-list")]
        public async Task<IActionResult> GetAlgoPortfolio()
        {
            try
            {
                _logger.LogInformation("Fetching portfolio for : {AlgoPortfolio}");
                var products = await _portfolioService.GetRealAlgoPortfolio().ConfigureAwait(false);
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching portfolio for : {AlgoPortfolio}");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPost("add-edit-algo-portfolio")]
        public async Task<IActionResult> AddEditAlgoPortfolio([FromBody] AlgoProductViewModel model)
        {
            if (model == null || string.IsNullOrWhiteSpace(model.Symbol) || model.Symbol.Length != 3)
            {
                _logger.LogWarning("Invalid AlgoProductViewModel received.");
                return BadRequest("Invalid request parameters.");
            }
            if (model.Action != "Buy" && model.Action != "Sell")
            {
                _logger.LogWarning("Invalid Action value received: {Action}", model.Action);
                return BadRequest("Action must be 'Buy' or 'Sell'.");
            }
            if (!model.OpenPrice.HasValue || model.OpenPrice <= 0)
            {
                _logger.LogWarning("Invalid OpenPrice value received: {OpenPrice}", model.OpenPrice);
                return BadRequest("OpenPrice must be provided and greater than 0.");
            }

            try
            {
                var result = await _portfolioService.AddOrEditAlgoPortfolioAsync(model).ConfigureAwait(false);
                if (result)
                {
                    return Ok("AlgoPortfolio record added/updated successfully.");
                }
                return BadRequest("Failed to add or update AlgoPortfolio record.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while adding/updating AlgoPortfolio: {Symbol}", model.Symbol);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("algo-portfolio-history")]
        public async Task<IActionResult> GetAlgoPortfolioHistory([FromQuery] PortfolioViewModel request)
        {
            var products = await _portfolioService.GetAlgoPortfolioHistory(request);

            return Ok(products);
        }

        [HttpDelete("delete-algo-portfolio/{algoPortfolioId}")]
        public async Task<IActionResult> DeleteAlgoPortfolio(int algoPortfolioId)
        {
            if (algoPortfolioId <= 0)
            {
                _logger.LogWarning("Invalid AlgoPortfolioId received for delete.");
                return BadRequest("Invalid AlgoPortfolioId.");
            }

            try
            {
                var result = await _portfolioService.DeleteAlgoPortfolioAsync(algoPortfolioId).ConfigureAwait(false);
                if (result)
                {
                    return Ok("AlgoPortfolio record deleted successfully.");
                }
                return NotFound("AlgoPortfolio record not found.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting AlgoPortfolio: {AlgoPortfolioId}", algoPortfolioId);
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

    }
}