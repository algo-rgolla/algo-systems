using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class PortfolioHistoryController : ControllerBase
    {
        private readonly IEodhdPortfolioService _portfolioService;
        private readonly IPortfolioHistoryService _portfolioHistoryService;

        public PortfolioHistoryController(IEodhdPortfolioService portfolioService, IPortfolioHistoryService portfolioHistoryService)
        {
            _portfolioService = portfolioService;
            _portfolioHistoryService = portfolioHistoryService;
        }

        [HttpGet("api/eodhd/portfoliohistory")]
        public async Task<IActionResult> GetPortfolioHistory([FromQuery] PortfolioViewModel request)
        {
            var products = await _portfolioService.GetPortfolioHistory(request);

            return Ok(products);
        }
        [HttpDelete("api/portfoliohistory/delete/{id}")]
        public async Task<IActionResult> DeleteById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid Id.");
            }

            var result = await _portfolioHistoryService.DeleteByIdAsync(id);
            if (!result)
            {
                return NotFound("Watchlist item not found.");
            }

            return Ok(true);
        }

    }
}
