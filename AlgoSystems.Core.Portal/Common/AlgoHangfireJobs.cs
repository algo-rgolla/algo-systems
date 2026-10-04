using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using Hangfire;

namespace AlgoSystems.Core.Portal.Common
{
    public static class AlgoHangfireJobs
    {
        public static void RegisterJobs()
        {
            //TimeZoneInfo easternStandardTimeZone = TimeZoneInfo.FindSystemTimeZoneById("AUS Eastern Standard Time");

            //RecurringJob.AddOrUpdate<DownloadService>(
            //    "Service.DownloadProductDetails",
            //    x => x.DownloadProductDetails(),
            //    "0,30 10-17 * * 1-5",
            //    easternStandardTimeZone
            //    );

            //RecurringJob.AddOrUpdate<ScanBusinessLogic>(
            //    "Service.ProcessAsxProductScans",
            //    x => x.ProcessAsxProductScans(),
            //    "0,45 10-17 * * 1-5",
            //    easternStandardTimeZone
            //    );

            //RecurringJob.AddOrUpdate<PortfolioService>(
            //    "Service.ProcessAsxProductScans",
            //    x => x.ManageLongPortfolio(),
            //    "0,30 11-17 * * 1-5",
            //    easternStandardTimeZone
            //    );

            ////Run the clean scan results every day 2 am.
            //RecurringJob.AddOrUpdate<CommonService>(
            //    "CommonService.CleanupScanResults",
            //    x => x.CleanupScanResults(),
            //    "0 2 * * 1-5",
            //    easternStandardTimeZone
            //    );

        }
    }
}
