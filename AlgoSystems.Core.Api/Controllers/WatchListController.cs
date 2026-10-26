using AlgoSystems.Application.Watchlists;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class WatchListController : ControllerBase
    {
        private readonly WatchlistService _watchlistService;

        public WatchListController(WatchlistService watchlistService)
        {
            _watchlistService = watchlistService;
        }

        [HttpGet("api/eodhd/products/watchlist")]
        public async Task<IActionResult> GetWatchList(CancellationToken cancellationToken)
        {
            var products = await _watchlistService.GetWatchlistAsync(cancellationToken);

            return Ok(products);
        }

        // Delete a watchlist item by Id
        [HttpDelete("api/watchlist/delete/{id}")]
        public async Task<IActionResult> DeleteById(int id, CancellationToken cancellationToken)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid Id.");
            }

            var result = await _watchlistService.DeleteWatchlistItemAsync(id, cancellationToken);
            if (!result)
            {
                return NotFound("Watchlist item not found.");
            }

            return Ok(true);
        }
    }
}
