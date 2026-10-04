using Quartz;
using Serilog;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algo.Quartz.WinService.Jobs 
{
    internal class JobDownloadLiveSymbols : IJob
    {
        public Task Execute(IJobExecutionContext context)
        {
            Log.Information($"Download Live Symbols - Job executed at {DateTime.Now}");

            return Task.CompletedTask;
        }
    }
}
