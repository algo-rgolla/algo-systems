using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using AlgoSystems.Application.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;

namespace AlgoSystems.Core.Api.Common
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate _next;

        public LoggingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, AlgoSystemsContext dbContext, IUserContext userContext)
        {
            if (context.Request.Path.StartsWithSegments("/api"))
            {
                //if (userContext.UserId == null)
                //{
                //    // throw bad request
                //    context.Response.StatusCode = StatusCodes.Status400BadRequest;
                //    await context.Response.WriteAsync("Bad Request");
                //    return;
                //}
                //else
                {
                    // Log the user details
                    await Utils.LogUserDetails(dbContext, userContext);
                }
            }
            // Call the next middleware in the pipeline
            await _next(context);
        }
    }
}
