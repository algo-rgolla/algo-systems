using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class WatchlistController : Controller
    {
        private readonly IWatchlistService _watchlistService;

        public WatchlistController(IWatchlistService watchlistService)
        {
            _watchlistService = watchlistService;
        }

        public IActionResult Index()
        {
            var model = _watchlistService.GetWatchList("Long");
            model.ProductViewType = "Watchlist";

            return View(model);
        }
    }
}
