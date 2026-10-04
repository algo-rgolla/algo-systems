using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using AlgoSystems.Application.Repositories;
using Repository.Interfaces;
using Repository.Repositories;

namespace AlgoSystems.Core.Portal.Common
{

    public static class IoCExtensions
    {
        public static void RegisterApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IDownloadService, DownloadService>();

            services.AddScoped<IWatchlistService, WatchlistService>();
            services.AddScoped<ISearchService, SearchService>();
            services.AddScoped<IScanBusinessLogic, ScanBusinessLogic>();
            services.AddScoped<IProductService, ProductService>();
            services.AddScoped<ICommonService, CommonService>();
            services.AddScoped<IPortfolioService, PortfolioService>();

            services.AddScoped<DbContext, AlgoSystemsContext>();

            //Repositories
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ILookupRepository, LookupRepository>();
            services.AddScoped<IWatchlistRepository, WatchlistRepository>();
        }

        public static void RegisterDataServices(this IServiceCollection services, IConfiguration config)
        {
            string connectionString = config["ConnectionStrings:DefaultConnection"];

            services.AddDbContext<AlgoSystemsContext>(options => options.UseSqlServer(connectionString, o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));
            //services.AddDbContextPool<AlgoSystemsContext>(options => options.UseSqlServer(connectionString));

            //services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        }
    }
}
