using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Interfaces
{
    public interface IScanBusinessLogic
    {
        //public void ProcessProductScans();

        //public void ProcessAsxProductScans();
        public Task<bool> ProcessEodProductScans();
        public ProductsViewModel GetProductScanResult(LongScanViewModel request);
        Task<ProductsViewModel> GetProductScanResultAsync(LongScanViewModel request);
        Task<ProductsViewModel> GetWatchlistAsync();
        Task<bool> DeleteWatchByIdAsync(int id);
        Task<ScanCounterListDto> GetScanCounters();
        public Task<bool> ProcessUSProductScans();

    }
}
