using AlgoSystems.Common.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class DummyHttpUserContext : IUserContext
    {
        public string? UserId => "RGolla";

        public string? Email => "admin@algosystems.com.au";

        public string RequestUrl => "dummy-site-path";
    }
}
