using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.ComponentModel;

namespace AlgoSystems.Common.Helpers
{
    public static class EnumHelper
    {
        public static string GetDescription(this Enum value)
        {
            //MyEnum value = MyEnum.Value1;
            //string description = value.GetDescription(); // "Value One"

            var field = value.GetType().GetField(value.ToString());
            var attributes = (DescriptionAttribute[])field.GetCustomAttributes(typeof(DescriptionAttribute), false);
            return attributes.Length > 0 ? attributes[0].Description : value.ToString();
        }
    }
}
