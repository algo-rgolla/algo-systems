using Quartz;
using Serilog;

namespace Algo.Quartz.WinService.Jobs
{
    internal class JobDownloadSymbols : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            Log.Information($"DownloadSymbols - Job executed at {DateTime.Now}");

            return Task.CompletedTask;
        }
    }
}
