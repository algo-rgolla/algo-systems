using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Services;
using AlgoSystems.Core.Portal.Common;
using AlgoSystems.Core.Portal.Options;
using AlgoSystems.Domain.Entities.Models;
using Hangfire;
using Hangfire.Dashboard;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using NLog;
using NLog.Web;

namespace AlgoSystems.Core.Portal
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var logger = NLog.LogManager.Setup().LoadConfigurationFromAppSettings().GetCurrentClassLogger();
            logger.Debug("init main");

            //var configManager = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();

            //Identity Methods
            services.AddIdentity<ApplicationUser, IdentityRole>()
                            .AddEntityFrameworkStores<AlgoSystemsContext>();
            
            // Add services to the container.
            services.AddControllersWithViews();
            services.RegisterDataServices(Configuration);
            services.RegisterApplicationServices();

            services.ConfigureApplicationCookie(options =>
                options.AccessDeniedPath = new PathString("/Admin/AccessDenied")
            );

            //Setup Policy
            services.AddAuthorization(options =>
            {
                //Claims Policy
                options.AddPolicy("DeleteRolePolicy",
                    policy => policy.RequireClaim("Delete Role"));

                options.AddPolicy("EditRolePolicy",
                policy => policy.RequireClaim("Edit Role", "true"));

                //Roles Policy
                options.AddPolicy("AdminRolePolicy",
                policy => policy.RequireRole("Admin"));
            });

            services.Configure<ApplicationSettings>(Configuration.GetSection("ApplicationSettings"));

            string hangfireConnection = Configuration["ConnectionStrings:HangfireConnection"];
            //// Add Hangfire services.
            //services.AddHangfire(configuration => configuration
            //    .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
            //    .UseSimpleAssemblyNameTypeSerializer()
            //    .UseRecommendedSerializerSettings()
            //    .UseSqlServerStorage(hangfireConnection, new SqlServerStorageOptions
            //    {
            //        CommandBatchMaxTimeout = TimeSpan.FromMinutes(60),
            //        SlidingInvisibilityTimeout = TimeSpan.FromMinutes(60),
            //        QueuePollInterval = TimeSpan.Zero,
            //        UseRecommendedIsolationLevel = true,
            //        DisableGlobalLocks = true
            //    }));

            // Add the processing server as IHostedService
            //services.AddHangfireServer();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseAuthentication();
            //app.UseHangfireDashboard("/hangfire", new DashboardOptions
            //{
            //    Authorization = new [] {new HangfireAuthorizationFilter() }
            //});

            //app.UseHangfireServer();

            AlgoHangfireJobs.RegisterJobs();

            app.UseRouting();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Dashboard}/{action=Index}/{id?}");
            });
        }
    }
}
