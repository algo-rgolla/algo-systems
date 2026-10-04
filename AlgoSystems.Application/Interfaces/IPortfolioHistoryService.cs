using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Interfaces
{
    public interface IPortfolioHistoryService
    {
        Task<bool> DeleteByIdAsync(int id);
    }
}