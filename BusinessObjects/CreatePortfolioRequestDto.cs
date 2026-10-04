using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.BusinessObjects
{
    public class CreatePortfolioRequestDto
    {
        public required string Symbol { get; set; }

        public string Action { get; set; }

        public double? OpenPrice { get; set; }

        public int? Volume { get; set; }
    }
}
