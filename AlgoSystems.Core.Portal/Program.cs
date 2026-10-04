using AlgoSystems.Core.Portal;
using NLog.Web;

namespace DevHandfire
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    //NLog Configuration
                    webBuilder.ConfigureLogging(logging =>
                    {
                        logging.ClearProviders();
                    });
                    webBuilder.UseNLog();
                    webBuilder.UseStartup<Startup>();

                });
    }
}
