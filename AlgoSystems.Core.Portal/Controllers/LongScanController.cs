using AlgoSystems.Application.Interfaces;
using AlgoSystems.Common;
using AlgoSystems.Core.Portal.Models;
using BusinessObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlgoSystems.Core.Portal.Controllers
{
//    [Authorize]
    public class LongScanController : Controller
    {
        private readonly IScanBusinessLogic _scanService;

        public LongScanController(IScanBusinessLogic scanService)
        {
            _scanService = scanService;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult MacdCrossover(string scanType)
        {
            var request = new LongScanViewModel();
            request.ScanName = Scans.LongMACDCrossover.ToString();
            var model = _scanService.GetProductScanResult(request);
            model.PageHeader = "MACD Trend Start";
            return View("~/Views/LongScan/Index.cshtml", model);
        }
        //public IActionResult MacdHistogram(string scanType)
        //{
        //    var request = new LongScanViewModel();
        //    request.ScanName = Scans.LongMACDHistogram.ToString();
        //    var model = _scanService.GetProductScanResult(request);
        //    model.PageHeader = "MACD Histogram";
        //    return View("~/Views/LongScan/Index.cshtml", model);
        //}
        public IActionResult BigGainers(string scanType)
        {
            var request = new LongScanViewModel();
            request.ScanName = Scans.LongBigGainers.ToString();
            var model = _scanService.GetProductScanResult(request);
            model.PageHeader = "Big Gainers";
            return View("~/Views/LongScan/Index.cshtml", model);
        }

        public IActionResult EMATrendStart(string scanType)
        {
            var request = new LongScanViewModel();
            request.ScanName = Scans.LongEMATrendStarters.ToString();
            var model = _scanService.GetProductScanResult(request);
            model.PageHeader = "EMA Trend Start";
            return View("~/Views/LongScan/Index.cshtml", model);
        }

        public IActionResult EMACrossover(string scanType)
        {
            var request = new LongScanViewModel();
            request.ScanName = Scans.LongEMACrossover.ToString();
            var model = _scanService.GetProductScanResult(request);
            model.PageHeader = "EMA Crossover";
            return View("~/Views/LongScan/Index.cshtml", model);
        }

        public IActionResult BullishTweezers()
        {
            var model = new LongScanViewModel();
            model.ScanName = "BullishTweezers";
            return View("~/Views/LongScan/Index.cshtml");
        }

        public IActionResult BullishThrusting()
        {
            var model = new LongScanViewModel();

            return View("~/Views/LongScan/Index.cshtml");
        }
        public IActionResult BullishEngulfing()
        {
            var model = new LongScanViewModel();

            return View("~/Views/LongScan/Index.cshtml");
        }


    }
}
