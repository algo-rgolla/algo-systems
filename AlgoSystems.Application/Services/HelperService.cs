using AlgoSystems.Domain.Entities.Models;
using NetTrader.Indicator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class HelperService
    {
        internal AlgoSystemsContext _context;
        public HelperService(AlgoSystemsContext context)
        {
            _context = context;
        }
    }
}
