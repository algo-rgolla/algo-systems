using AlgoSystems.Application.Interfaces;
using AlgoSystems.Common;
using AlgoSystems.Domain.Entities.Models;
using NetTrader.Indicator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class IndicatorService : IIndicatorService
    {
        internal AlgoSystemsContext _context;
        HelperService _helperService;
        public IndicatorService(AlgoSystemsContext context)
        {
            _context = context;
            _helperService = new HelperService(context);
        }
        private static int Get52DayAvgVolume(List<Ohlc> list, int days)
        {
            return Convert.ToInt32(list.OrderByDescending(x => x.Date).Take(days).Average(x => x.Volume));
        }

        private static MACDSerie GetMACD(List<Ohlc> list)
        {
            MACD atr = new MACD();
            atr.Load(list);
            return atr.Calculate();
        }

        private static double? GetEMA(List<Ohlc> list, int daysEma)
        {
            //EMA 
            EMA ema = new EMA(daysEma, false);
            ema.Load(list);
            SingleDoubleSerie serie = ema.Calculate();
            var value = serie.Values.Count == 0 ? 0 : Convert.ToDecimal(serie.Values.Last());

            return Convert.ToDouble(Math.Round(value, 2));
        }

        private static double? GetATR(List<Ohlc> list, int daysAtr)
        {
            ATR atr = new ATR(daysAtr);
            atr.Load(list);
            ATRSerie serie = atr.Calculate();
            var value =  serie.ATR.Count == 0 ? 0 : Convert.ToDecimal(serie.ATR.Last());
            return Convert.ToDouble(Math.Round(value, 2));
        }
    }
}
