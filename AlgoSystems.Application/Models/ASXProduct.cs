using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Models
{
    public class ASXProduct
    {
        public string code { get; set; }
        public string isin_code { get; set; }
        public string desc_full { get; set; }
        public double last_price { get; set; }
        public double open_price { get; set; }
        public double day_high_price { get; set; }
        public double day_low_price { get; set; }
        public double change_price { get; set; }
        public string change_in_percent { get; set; }
        public int volume { get; set; }
        public double bid_price { get; set; }
        public double offer_price { get; set; }
        public double previous_close_price { get; set; }
        public string previous_day_percentage_change { get; set; }
        public double year_high_price { get; set; }
        public DateTime last_trade_date { get; set; }
        public DateTime year_high_date { get; set; }
        public double year_low_price { get; set; }
        public DateTime year_low_date { get; set; }
        public double year_open_price { get; set; }
        public DateTime year_open_date { get; set; }
        public double year_change_price { get; set; }
        public string year_change_in_percentage { get; set; }
        public double pe { get; set; }
        public double eps { get; set; }
        public int average_daily_volume { get; set; }
        public double annual_dividend_yield { get; set; }
        public long market_cap { get; set; }
        public long number_of_shares { get; set; }
        public long deprecated_market_cap { get; set; }
        public long deprecated_number_of_shares { get; set; }
        public bool suspended { get; set; }
    }
}
