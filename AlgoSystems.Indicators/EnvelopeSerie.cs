using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Indicators
{
    public class EnvelopeSerie : IIndicatorSerie
    {
        public List<double?> Upper { get; set; }
        public List<double?> Lower { get; set; }

        public EnvelopeSerie()
        {
            Upper = new List<double?>();
            Lower = new List<double?>();
        }
    }
}
