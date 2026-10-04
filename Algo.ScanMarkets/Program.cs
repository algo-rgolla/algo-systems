using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using AlgoSystems.BusinessLogic.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Serilog;

namespace Algo.ScanMarkets
{
    internal class Program
    {
        static async Task Main(string[] args)
        {
            Log.Logger = new LoggerConfiguration()
               .WriteTo.RollingFile("Algo-Scan-Batch-{Date}.txt")
               .MinimumLevel.Override("Microsoft.EntityFrameworkCore", Serilog.Events.LogEventLevel.Fatal)
               .CreateLogger();

            Log.Information("Process Started at : " + DateTime.Now);

            var services = new ServiceCollection();
            ConfigureServices(services);

            var serviceProvider = services.BuildServiceProvider();
            var eodhdDownloadService = serviceProvider.GetService<IEodhdDownloadService>();
            var scanService = serviceProvider.GetService<IScanBusinessLogic>();
            var portfolioService = serviceProvider.GetService<IEodhdPortfolioService>();

            //3. Process Daily Scans
            bool result = await scanService.ProcessEodProductScans();

            ////4. Manage Portfolio
            portfolioService.ManageLongPortfolio();

            portfolioService.ManageAlgoPortfolio();

            Log.Information("Process Ended at : " + DateTime.Now);
        }

        private static void ConfigureServices(ServiceCollection services)
        {
            var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

            IConfiguration config = builder.Build();
            string connectionString = config["ConnectionStrings:DefaultConnection"];

            // Add AutoMapper to the service collection
            //builder.ser services.AddAutoMapper(typeof(Program));

            services
                .AddSerilog()
                .AddLogging()
                .AddSingleton<IDownloadService, DownloadService>()
                .AddSingleton<IEodhdDownloadService, EodhdDownloadService>()
                .AddSingleton<IIndicatorService, IndicatorService>()
                .AddSingleton<IUserContext, DummyHttpUserContext>()
                .AddSingleton<IScanBusinessLogic, ScanBusinessLogic>()
                .AddSingleton<IPortfolioService, PortfolioService>()
                .AddSingleton<IEodhdPortfolioService, EodhdPortfolioService>()
                //.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>))
                .AddDbContext<AlgoSystemsContext>(options => options.UseSqlServer(connectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)))
                //.AddAutoMapper(type)

                ;

        }

    }
}
