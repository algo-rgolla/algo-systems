using AlgoSystems.Common;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Common
{
    public static class Utils
    {
        public static double GetStopLoss(EodhdSymbolDetail product)
        {
            var atrRiskPercent = Constants.ATR_Stock_Loss;
            double stopLoss = 0.0;
            if (product.Atr != null && product.Atr > 0)
            {
                var atrPrice = product.Close < 1 ?
                    Constants.ATR_Penny_Stock_Loss * Convert.ToDouble(product.Atr)
                    : Constants.ATR_Stock_Loss * Convert.ToDouble(product.Atr);
                
                stopLoss = Convert.ToDouble((double)product.Close - atrPrice);
                //Rount the stopLoss value decimal point 2
                stopLoss = Math.Round(stopLoss, 2);
            }
            return stopLoss;
        }

        public static async Task<bool> LogUserDetails(AlgoSystemsContext context, IUserContext userContext)
        {
            var userAccessLog = new UserAccessLog
            {
                UserName = userContext.Email,
                LoggedTime = DateTime.Now,
                Url = userContext.RequestUrl,
            };

            context.UserAccessLogs.Add(userAccessLog);
            await context.SaveChangesAsync();
            return true;
        }
        public static bool IsValidMarketTime()
        {
            DateTime now = DateTime.Now;
            DayOfWeek day = now.DayOfWeek;
            TimeSpan currentTime = now.TimeOfDay;

            TimeSpan marketOpen = new TimeSpan(10, 0, 0); // 10:00 AM
            TimeSpan marketClose = new TimeSpan(16, 0, 0); // 4:00 PM

            bool isWeekday = day >= DayOfWeek.Monday && day <= DayOfWeek.Friday;
            bool isMarketHours = currentTime >= marketOpen && currentTime <= marketClose;

            return isWeekday && isMarketHours;
        }

        /// <summary>
        /// Converts the given string to a decimal.
        /// Returns a default value (0 by default) if the conversion fails.
        /// </summary>
        /// <param name="input">The string to convert.</param>
        /// <param name="defaultValue">The default value to return if conversion fails. Defaults to 0.</param>
        /// <returns>A decimal representation of the input string, or the default value if conversion fails.</returns>
        public static decimal ToDecimal(string input, decimal defaultValue = 0)
        {
            if (string.IsNullOrWhiteSpace(input))
                return defaultValue;

            if (decimal.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal result))
                return result;

            return defaultValue;
        }

        /// <summary>
        /// Converts the given string to a double.
        /// Returns a default value (0 by default) if the conversion fails.
        /// </summary>
        /// <param name="input">The string to convert.</param>
        /// <param name="defaultValue">The default value to return if conversion fails. Defaults to 0.</param>
        /// <returns>A double representation of the input string, or the default value if conversion fails.</returns>
        public static double ToDouble(string input, double defaultValue = 0)
        {
            if (string.IsNullOrWhiteSpace(input))
                return defaultValue;

            if (double.TryParse(input, NumberStyles.Any, CultureInfo.InvariantCulture, out double result))
                return result;

            return defaultValue;
        }

        /// <summary>
        /// Converts a valid date string to a DateOnly. Returns null if the string is not a valid date.
        /// </summary>
        /// <param name="dateString">The date string to parse.</param>
        /// <returns>The parsed DateOnly or null if invalid.</returns>
        public static DateOnly? ToDateOnly(string dateString)
        {
            if (DateOnly.TryParse(dateString, out DateOnly date))
            {
                return date;
            }
            return null; // Return null if parsing fails
        }
        /// <summary>
        /// Converts the given string to a long.
        /// Returns a default value (0 by default) if the conversion fails.
        /// </summary>
        /// <param name="input">The string to convert.</param>
        /// <param name="defaultValue">The default value to return if conversion fails. Defaults to 0.</param>
        /// <returns>A long representation of the input string, or the default value if conversion fails.</returns>
        public static long ToLong(string input, long defaultValue = 0)
        {
            if (string.IsNullOrWhiteSpace(input))
                return defaultValue;

            if (long.TryParse(input, NumberStyles.Integer, CultureInfo.InvariantCulture, out long result))
                return result;

            return defaultValue;
        }
        public static string ToKMB(decimal num)
        {
            if (num > 999999999 || num < -999999999)
            {
                return num.ToString("0,,,.###B", CultureInfo.InvariantCulture);
            }
            else
            if (num > 999999 || num < -999999)
            {
                return num.ToString("0,,.##M", CultureInfo.InvariantCulture);
            }
            else
            if (num > 999 || num < -999)
            {
                return num.ToString("0,.#K", CultureInfo.InvariantCulture);
            }
            else
            {
                return num.ToString(CultureInfo.InvariantCulture);
            }
        }

        public static int DaysFromToday(DateTime? inputDate)
        {
            if (inputDate == null)
                return 0;

            // Calculate the difference in days
            int daysDifference = (DateTime.Today - Convert.ToDateTime(inputDate)).Days;
            return daysDifference;
        }
    }
}
