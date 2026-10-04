using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Indicators
{
    public class SingleIntSerie : IIndicatorSerie
    {
        public List<int?> Values { get; set; }

        public SingleIntSerie()
        {
            Values = new List<int?>();
        }
    }
}
