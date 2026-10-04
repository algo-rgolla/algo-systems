using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Models
{
    public class ASXProductHistory
    {
        public string code { get; set; }
        public DateTime close_date { get; set; }
        public double close_price { get; set; }
        public double change_price { get; set; }
        public int volume { get; set; }
        public double day_high_price { get; set; }
        public double day_low_price { get; set; }
        public string change_in_percent { get; set; }
    }

    public class ASXProductHistories
    {
        public List<ASXProductHistory> data { get; set; }
    }
}
