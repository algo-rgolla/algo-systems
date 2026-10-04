using AlgoSystems.Application.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Api.Controllers
{
    //[Route("api/[controller]")]
    [ApiController]
    public class WatchListController : ControllerBase
    {
        private readonly IScanBusinessLogic _scanBusinessLogic;

        public WatchListController(IScanBusinessLogic scanBusinessLogic)
        {
            _scanBusinessLogic = scanBusinessLogic;
        }

        [HttpGet("api/eodhd/products/watchlist")]
        public async Task<IActionResult> GetWatchList()
        {
            var products = await _scanBusinessLogic.GetWatchlistAsync();

            return Ok(products);
        }

        // Create a new watchlist item
        //[HttpPost]
        //public async Task<IActionResult> CreateWatchlistItem([FromBody] WatchlistItemDto watchlistItem)
        //{
        //    if (watchlistItem == null)
        //    {
        //        return BadRequest("Invalid watchlist item.");
        //    }

        //    var createdItem = await _scanBusinessLogic.CreateWatchlistAsync(watchlistItem);
        //    return CreatedAtAction(nameof(GetWatchList), new { id = createdItem.Id }, createdItem);
        //}

        // Edit an existing watchlist item
        //[HttpPut("{id}")]
        //public async Task<IActionResult> EditWatchlistItem(int id, [FromBody] WatchlistItemDto watchlistItem)
        //{
        //    if (watchlistItem == null || id <= 0)
        //    {
        //        return BadRequest("Invalid request.");
        //    }

        //    //var updatedItem = await _scanBusinessLogic.UpdateWatchlistAsync(id, watchlistItem);
        //    //if (updatedItem == null)
        //    //{
        //    //    return NotFound("Watchlist item not found.");
        //    //}

        //    //return Ok(updatedItem);
        //}

        // Delete a watchlist item by Id
        [HttpDelete("api/watchlist/delete/{id}")]
        public async Task<IActionResult> DeleteById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Invalid Id.");
            }

            var result = await _scanBusinessLogic.DeleteWatchByIdAsync(id);
            if (!result)
            {
                return NotFound("Watchlist item not found.");
            }

            return Ok(true);
        }

    }
}
