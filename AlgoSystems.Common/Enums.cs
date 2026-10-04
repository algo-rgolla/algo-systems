using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Common
{
    public enum ExchangeTypeEnum
    {
        Asx = 1,
        America = 2,
        Nasdac = 3
    }
    public enum ScansEnum
    {
        [Description("Value One")]
        LongMACDCrossover = 0,
        
        [Description("Value One")]
        LongMACDHistogram = 1
    }
}
