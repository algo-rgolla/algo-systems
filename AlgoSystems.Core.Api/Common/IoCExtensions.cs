using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Repositories;
using AlgoSystems.Application.Services;
using AlgoSystems.Application.Watchlists;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Repository.Interfaces;
using Repository.Repositories;

namespace AlgoSystems.Core.Api.Common
{
    public static class IoCExtensions
    {
        public static void RegisterApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<DbContext, AlgoSystemsContext>();

            //services.AddScoped<IDownloadService, DownloadService>();
            services.AddScoped<WatchlistService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<IScanBusinessLogic, ScanBusinessLogic>();
            services.AddScoped<ICommonService, CommonService>();
            services.AddScoped<IPortfolioService, PortfolioService>();
            services.AddScoped<IEodhdPortfolioService, EodhdPortfolioService>();
            services.AddScoped<ISearchBusinessLogic, SearchBusinessLogic>();
            services.AddScoped<IPortfolioHistoryService, PortfolioHistoryService>();

            //Repositories
            services.AddScoped<ILookupRepository, LookupRepository>();
            services.AddScoped<IWatchlistRepository, WatchlistRepository>();
            services.AddScoped<IUserContext, HttpUserContext>();

        }

        public static void RegisterDataServices(this IServiceCollection services, IConfiguration config)
        {
            string connectionString = config["ConnectionStrings:DefaultConnection"];

            //services.AddDbContext<AlgoSystemsContext>(options => options.UseSqlServer(connectionString, 
            //    o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

            services.AddDbContext<AlgoSystemsContext>(options =>
                options.UseSqlServer(connectionString, sqlServerOptions =>
                {
                    // Enable retry logic for transient errors
                    sqlServerOptions.EnableRetryOnFailure(
                        maxRetryCount: 5, // Number of retry attempts
                        maxRetryDelay: TimeSpan.FromSeconds(10), // Delay between retries
                        errorNumbersToAdd: null // Optional: specify SQL error codes
                    );

                    // Set Query Splitting behavior for handling split queries
                    sqlServerOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
                    
                })
                .ConfigureWarnings(warnings => warnings.Ignore(CoreEventId.ManyServiceProvidersCreatedWarning))
                .LogTo(Console.WriteLine, new[] { DbLoggerCategory.Database.Command.Name }, LogLevel.None)
                );
            //services.AddDbContextPool<AlgoSystemsContext>(options => options.UseSqlServer(connectionString));

            //services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        }
    }

}
