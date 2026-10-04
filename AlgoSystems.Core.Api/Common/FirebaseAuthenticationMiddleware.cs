using FirebaseAdmin.Auth;
using Microsoft.Extensions.Configuration;

namespace AlgoSystems.Core.Api.Common
{
    public class FirebaseAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IConfiguration _configuration;

        public FirebaseAuthenticationMiddleware(RequestDelegate next, IConfiguration configuration)
        {
            _next = next;
            _configuration = configuration;
        }

        public async Task Invoke(HttpContext context)
        {
            // Exclude Swagger endpoints from the middleware
            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                await _next(context);
                return;
            }

            // Handle preflight (OPTIONS) requests
            if (context.Request.Method == HttpMethods.Options)
            {
                AddCorsHeaders(context);
                context.Response.StatusCode = StatusCodes.Status200OK;
                return;
            }

            //var authorizationHeader = context.Request.Headers["Authorization"].FirstOrDefault();
            //if (string.IsNullOrEmpty(authorizationHeader))
            //{
            //    // Add CORS headers to the response
            //    AddCorsHeaders(context);

            //    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            //    await context.Response.WriteAsync("Authorization header missing or invalid.");
            //    return;
            //}

            //if (!string.IsNullOrEmpty(authorizationHeader) && authorizationHeader.StartsWith("Bearer "))
            //{
            //    var token = authorizationHeader.Substring("Bearer ".Length);

            //    try
            //    {
            //        FirebaseToken decodedToken = await FirebaseAdmin.Auth.FirebaseAuth.DefaultInstance
            //            .VerifyIdTokenAsync(token);

            //        var uid = decodedToken.Uid;
            //        var email = decodedToken.Claims["email"];

            //        // Reject the request if the token is invalid or expired
            //        if (decodedToken == null || string.IsNullOrEmpty(uid))
            //        {
            //            // Add CORS headers to the response
            //            AddCorsHeaders(context);

            //            context.Response.StatusCode = 401;
            //            await context.Response.WriteAsync("Invalid token");
            //            return;
            //        }

            //        // Store in HttpContext for use in controllers
            //        context.Items["UserId"] = uid;
            //        context.Items["Email"] = email;
            //    }
            //    catch
            //    {
            //        // Add CORS headers to the response
            //        AddCorsHeaders(context);

            //        context.Response.StatusCode = 401;
            //        await context.Response.WriteAsync("Invalid Firebase token");
            //        return;
            //    }
            //}

            await _next(context);
        }

        private void AddCorsHeaders(HttpContext context)
        {
            // Get allowed origins from configuration
            var allowedOrigins = _configuration.GetSection("AllowedOrigins").Get<string[]>();

            // Get the origin of the current request
            var requestOrigin = context.Request.Headers["Origin"].FirstOrDefault();

            // Check if the request origin is in the allowed origins list
            if (!string.IsNullOrEmpty(requestOrigin) && allowedOrigins.Contains(requestOrigin))
            {
                context.Response.Headers.Add("Access-Control-Allow-Origin", requestOrigin);
            }

            context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Authorization, Content-Type");
        }
    }
}