using Algo.Quartz.WinService.Jobs;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Quartz;
using Serilog;
using static Quartz.Logging.OperationName;

namespace Algo.Quartz.WinService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
                .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
                .CreateLogger();

            try
            {
                Log.Information("Starting the service...");
                CreateHostBuilder(args).Build().Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "The service failed to start.");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .UseWindowsService()
        .UseSerilog() // Use Serilog for logging
.ConfigureServices((hostContext, services) =>
{
    services.AddQuartz(q =>
    {
        // Register the jobs
        //q.UseMicrosoftDependencyInjectionJobFactory();

        // Add Job 1 (7 AM Mon-Fri)
        //q.AddJobAndTrigger<JobDownloadSymbols>("0 0 7 ? * MON-FRI");
        q.AddJobAndTrigger<JobDownloadSymbols>("0 */2 * ? * *"); // Every 2 min

        // Add Job 2 (Every hour from 11 AM to 5 PM Mon-Fri)
        //q.AddJobAndTrigger<JobDownloadLiveSymbols>("0 0 11-17 ? * MON-FRI");
        q.AddJobAndTrigger<JobDownloadLiveSymbols>("0 */3 * ? * *"); // Every 3 min
    });

    // Add Quartz.NET hosted service
    services.AddQuartzHostedService(q => q.WaitForJobsToComplete = true);
});
    }
}