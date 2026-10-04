using AlgoSystems.Application.Interfaces;
using AlgoSystems.Common;
using Azure.Core;
using BusinessObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class PortfolioController : Controller
    {
        private readonly IPortfolioService _portfolioService;

        public PortfolioController(IPortfolioService portfolioService)
        {
            _portfolioService = portfolioService;
        }

        public IActionResult Index()
        {
            return View();
        }

        //public ActionResult MacdCrossoverPortfolio()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongMACDCrossover.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "MACD Crossover";

        //    return View("~/Views/Portfolio/Index.cshtml", model);
        //}
        //public ActionResult MacdCrossoverHistory()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongMACDCrossover.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "MACD Crossover History";

        //    return View("~/Views/Portfolio/History.cshtml", model);

        //}
        //public ActionResult MacdMomentumPortfolio()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongMACDHistogram.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "MACD Momentum";

        //    return View("~/Views/Portfolio/Index.cshtml", model);
        //}
        //public ActionResult MacdMomentumHistory()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongMACDHistogram.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "MACD History";

        //    return View("~/Views/Portfolio/History.cshtml", model);

        //}
        //public ActionResult EMATrendStartPortfolio()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongEMATrendStarters.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "EMA Trend Starters";

        //    return View("~/Views/Portfolio/Index.cshtml", model);
        //}
        //public ActionResult EMATrendStartHistory()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongEMATrendStarters.ToString();
        //    var model = _portfolioService.GetAlgoPortfolioHistory(request);
        //    model.PageHeader = "Trend Starters History";

        //    return View("~/Views/Portfolio/History.cshtml", model);

        //}

        //public ActionResult EMACrossoverPortfolio()
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongEMACrossover.ToString();
        //    var model = _portfolioService.GetAlgoPortfolio(request);
        //    model.PageHeader = "Trend Starters";

        //    return View("~/Views/Portfolio/Index.cshtml", model);
        //}
        //public ActionResult EMACrossoverHistory()
        //{            
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongEMACrossover.ToString();
        //    var model = _portfolioService.GetAlgoPortfolioHistory(request);
        //    model.PageHeader = "Trend Starters History";
        //    model.ProductViewType = "PortfolioHistory";

        //    return View("~/Views/Portfolio/History.cshtml", model);
        //}
    }
}
