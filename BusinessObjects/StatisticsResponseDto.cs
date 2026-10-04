using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    public class StatisticsResponseDto
    {
        public string ScanType { get; set; }
        public List<StatisticItemDto> Statistics { get; set; }
    }
}
