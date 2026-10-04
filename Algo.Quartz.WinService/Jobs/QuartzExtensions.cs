using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Algo.Quartz.WinService.Jobs
{
    public static class QuartzExtensions
    {
        public static IServiceCollectionQuartzConfigurator AddJobAndTrigger<T>(
            this IServiceCollectionQuartzConfigurator quartzConfigurator, string cronExpression) where T : IJob
        {
            var jobKey = new JobKey(typeof(T).Name);

            quartzConfigurator.AddJob<T>(opts => opts.WithIdentity(jobKey));
            quartzConfigurator.AddTrigger(opts => opts
                .ForJob(jobKey)
                .WithIdentity($"{typeof(T).Name}-trigger")
                .WithCronSchedule(cronExpression));

            return quartzConfigurator;
        }
    }
}
