
using AlgoSystems.Core.Api.Common;
using Microsoft.AspNetCore.Rewrite;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using AlgoSystems.Common.Interfaces;

namespace AlgoSystems.Core.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);
            var path = Path.Combine(Directory.GetCurrentDirectory(), "serviceAccountKey.json");

            FirebaseApp.Create(new AppOptions()
            {
                Credential = GoogleCredential.FromFile(path),
            });

            // Add services to the container.
            // Add services to the container.
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    // Get the origins from the configuration
                    var origins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>();

                    // Check if the origins are not null or empty
                    if (origins == null || origins.Length == 0)
                    {
                        throw new ArgumentException("AllowedOrigins is not configured in appsettings.json");
                    }

                    // Set the origins in the CORS policy
                    policy.WithOrigins(origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            //Register 
            builder.Services.RegisterDataServices(builder.Configuration);
            builder.Services.RegisterApplicationServices();
            builder.Services.AddHttpContextAccessor();
            builder.Services.AddScoped<IUserContext, HttpUserContext>();

            var app = builder.Build();
            //if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseStaticFiles();
            app.UseRewriter(new RewriteOptions()
            .AddRedirect("^$", "swagger/index.html"));

            // Use CORS middleware
            app.UseRouting();
            app.UseCors("AllowReactApp");

            app.UseMiddleware<FirebaseAuthenticationMiddleware>();
            // Add the LoggingMiddleware
            app.UseMiddleware<LoggingMiddleware>();

            // Configure the HTTP request pipeline.
            app.UseSwagger();
            app.UseSwaggerUI();

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.Run();
        }
    }
}
