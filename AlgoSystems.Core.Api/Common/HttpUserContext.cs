using AlgoSystems.Common.Interfaces;

namespace AlgoSystems.Core.Api.Common
{
    public class HttpUserContext : IUserContext
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public HttpUserContext(IHttpContextAccessor contextAccessor)
        {
            _contextAccessor = contextAccessor;
        }

        public string? UserId => _contextAccessor.HttpContext?.Items["UserId"]?.ToString();
        public string? Email => _contextAccessor.HttpContext?.Items["Email"]?.ToString();

        public string? RequestUrl => _contextAccessor.HttpContext?.Request?.Path.ToString() + "/" + _contextAccessor.HttpContext?.Request.QueryString;
    }

}
