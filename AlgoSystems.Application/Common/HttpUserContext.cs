//using AlgoSystems.Common.Interfaces;
//using Microsoft.AspNetCore.Http;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;

//namespace AlgoSystems.BusinessLogic.Common
//{
//    public class HttpUserContext : IUserContext
//    {
//        private readonly IHttpContextAccessor? _contextAccessor;

//        public HttpUserContext(IHttpContextAccessor? contextAccessor)
//        {
//            _contextAccessor = contextAccessor;
//        }

//        public string? UserId => _contextAccessor?.HttpContext?.Items["UserId"]?.ToString();
//        public string? Email => _contextAccessor?.HttpContext?.Items["Email"]?.ToString();
//    }

//}
