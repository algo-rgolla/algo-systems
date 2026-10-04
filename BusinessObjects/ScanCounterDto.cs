using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    public class ScanCounterListDto
    {
        public bool IsAdmin { get; set; } = true;
        public List<ScanCounterDto> ScanCounters { get; set; } = new List<ScanCounterDto>();
    }
    public class ScanCounterDto
    {
        public string ScanTypeText { get; set; }
        public string ScanType { get; set; }

        public int ScanResultCount { get; set; }
    }
}
