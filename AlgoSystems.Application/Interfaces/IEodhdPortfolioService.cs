using AlgoSystems.BusinessObjects;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Interfaces
{
    public interface IEodhdPortfolioService
    {
        public void ManageLongPortfolio();
        public void ManageAlgoPortfolio();
        public Task<ProductsViewModel> GetAlgoPortfolio(PortfolioViewModel request);
        public Task<ProductsViewModel> GetAlgoPortfolioHistory(PortfolioViewModel request);
        public Task<ProductsViewModel> GetPortfolioHistory(PortfolioViewModel request);

        public Task<StatisticsResponseDto> GetPortfolioStatistics(StatisticsRequestDto request);
        Task<bool> CreatePortfolioAsync(CreatePortfolioRequestDto request);
        public Task<ProductsViewModel> GetRealAlgoPortfolio();
        Task<bool> AddOrEditAlgoPortfolioAsync(AlgoProductViewModel model);
        Task<bool> DeleteAlgoPortfolioAsync(int algoPortfolioId); // Added for delete
    }
}
