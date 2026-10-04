using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Diagnostics;
using System.IO;
using Serilog;

namespace AlgoSystems.Batch
{
    class Program
    {
        static void Main(string[] args)
        {
            var logger = new LoggerConfiguration()
                .WriteTo.RollingFile("AlgoBatch-{Date}.txt")
                .CreateLogger();

            logger.Information("Download Process Started at : " + DateTime.Now);

            var services = new ServiceCollection();
            ConfigureServices(services);

            //do the actual work here
            var serviceProvider = services.BuildServiceProvider();
            var downloadService = serviceProvider.GetService<IDownloadService>();
            var indicatorService = serviceProvider.GetService<IIndicatorService>();
            var scanService = serviceProvider.GetService<IScanBusinessLogic>();
            var portfolioService = serviceProvider.GetService<IPortfolioService>();

            logger.Information("Download Exchange Symbols Started at : " + DateTime.Now);
            //downloadService.DownloadExchangeSymbols();
            logger.Information("Download Exchange Symbols Ended at : " + DateTime.Now);

            //logger.Information("Download Product Daily Data Started at : " + DateTime.Now);
            //downloadService.DownloadProductDetails();
            //logger.Information("Download Product Daily Data Ended at : " + DateTime.Now);

            //logger.Information("Scan process Started at : " + DateTime.Now);
            //scanService.ProcessAsxProductScans();
            //logger.Information("Scan process Ended at : " + DateTime.Now);

            //logger.Information("Scan process Started at : " + DateTime.Now);
            //portfolioService.ManageLongPortfolio();
            //logger.Information("Scan process Ended at : " + DateTime.Now);
        }

        private static void ConfigureServices(ServiceCollection services)
        {
            var builder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false);

            IConfiguration config = builder.Build();
            string connectionString = config["ConnectionStrings:DefaultConnection"];

            services
                .AddLogging()
                .AddSingleton<IDownloadService, DownloadService>()
                .AddSingleton<IIndicatorService, IndicatorService>()
                .AddSingleton<IScanBusinessLogic, ScanBusinessLogic>()
                .AddSingleton<IPortfolioService, PortfolioService>()
                //.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>))
                .AddDbContext<AlgoSystemsContext>(options => options.UseSqlServer(connectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)))
                ;

        }
    }
}
