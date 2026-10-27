using System.ComponentModel.DataAnnotations;
using AlgoSystems.Application.Watchlists;
using BusinessObjects;
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

        /// <summary>The most recent watchlist entry per stock, newest first.</summary>
        [HttpGet("api/eodhd/products/watchlist")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<ProductsViewModel>> GetWatchList(CancellationToken cancellationToken)
        {
            return await _watchlistService.GetWatchlistAsync(cancellationToken);
        }

        /// <summary>Deletes a watchlist item by id. Returns <c>true</c> when it was deleted.</summary>
        [HttpDelete("api/watchlist/delete/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> DeleteById([Range(1, int.MaxValue)] int id, CancellationToken cancellationToken)
        {
            var result = await _watchlistService.DeleteWatchlistItemAsync(id, cancellationToken);

            return result switch
            {
                WatchlistDeleteResult.Deleted => true,
                WatchlistDeleteResult.Forbidden => Problem(statusCode: StatusCodes.Status403Forbidden, detail: "You are not allowed to delete watchlist items."),
                _ => Problem(statusCode: StatusCodes.Status404NotFound, detail: "Watchlist item not found."),
            };
        }
    }
}
