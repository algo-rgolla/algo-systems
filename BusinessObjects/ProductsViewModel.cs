using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessObjects
{
    public class ProductsViewModel
    {
        public string ScanType { get; set; }
        public string ProductViewType { get; set; }
        public int PageTotal { get; set; }
        public string PageHeader { get; set; }
        public List<ProductViewModel> Products { get; set; }
    }
}
