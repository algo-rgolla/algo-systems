using AlgoSystems.Application.Models;
using AlgoSystems.Domain.Entities.Models;
using NetTrader.Indicator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace AlgoSystems.Application.Common
{
    public static class IndicatorHelper
    {
        public  static List<Ohlc> AddTodayPrice(List<Ohlc> list, Product product)
        {
            var newList = list;
            var datetime = product.StockDate.HasValue ? product.StockDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue;
            var found = list.Where(x => x.Date == datetime).FirstOrDefault();
            if (found == null)
            {
                // Add today price to the history 
                var ohlc = new Ohlc
                {
                    Date = product.StockDate.HasValue ? product.StockDate.Value.ToDateTime(TimeOnly.MinValue) : DateTime.MinValue,
                    Low = product.LowPrice.Value,
                    High = product.HighPrice.Value,
                    Open = product.OpenPrice.Value,
                    Close = product.Close.Value,
                    Volume = product.Volume.Value,
                };
                newList.Add(ohlc);
            }
            return newList;
        }


        public static List<Ohlc> GetProductHistoryByCode(ASXProductHistories aSXProductHistories)
        {
            List<Ohlc> list = new List<Ohlc>();
            if (aSXProductHistories  != null)
            {
                foreach (var product in aSXProductHistories.data)
                {
                    var ohlc = new Ohlc
                    {
                        Date = product.close_date,
                        Low = product.day_low_price,
                        High = product.day_high_price,
                        Open = product.close_price,
                        Close = product.close_price,
                        Volume = product.volume,
                    };
                    list.Add(ohlc);
                }
            }

            //Todo: Add Today value
            return list;
        }

        public static MACDSerie GetMACD(List<Ohlc> list)
        {
            MACD atr = new MACD();
            atr.Load(list);
            return atr.Calculate();
        }

        public static double? GetEMA(List<Ohlc> list, int daysEma)
        {
            //EMA 
            EMA ema = new EMA(daysEma, false);
            ema.Load(list);
            SingleDoubleSerie serie = ema.Calculate();
            var value = serie.Values.Count == 0 ? 0 : Convert.ToDecimal(serie.Values.Last());

            return Convert.ToDouble(Math.Round(value, 2));
        }

        public static double? GetATR(List<Ohlc> list)
        {
            //ATR
            ATR atr = new ATR();
            atr.Load(list);

            ATRSerie serie = atr.Calculate();
            var value = serie.ATR.Count == 0 ? 0 : Convert.ToDecimal(serie.ATR.Last());

            return Convert.ToDouble(Math.Round(value, 2));
        }

        public static SingleDoubleSerie GetEMASerie(List<Ohlc> list, int daysEma)
        {
            //EMA 
            EMA ema = new EMA(daysEma, false);
            ema.Load(list);
            SingleDoubleSerie serie = ema.Calculate();
            return serie.Values.Count == 0 ? null : serie;
        }

        public static double? GetSMA(List<Ohlc> list, int daysEma)
        {
            //SMA 
            SMA sma = new SMA(daysEma);
            sma.Load(list);
            SingleDoubleSerie serie = sma.Calculate();
            var value = serie.Values.Count == 0 ? 0 : Convert.ToDecimal(serie.Values.Last());

            return Convert.ToDouble(Math.Round(value, 2));
        }

        public static SingleDoubleSerie GetSMASerie(List<Ohlc> list, int daysEma)
        {
            //SMA 
            SMA sma = new SMA(daysEma);
            sma.Load(list);
            SingleDoubleSerie serie = sma.Calculate();
            return serie.Values.Count == 0 ? null : serie;
        }


    }
}
