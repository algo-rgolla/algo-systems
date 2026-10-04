using AlgoSystems.Application.Extensions;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Common.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using BusinessObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class PortfolioHistoryService : IPortfolioHistoryService
    {
        internal AlgoSystemsContext _context;
        private readonly ILogger<PortfolioHistoryService> _logger;
        private readonly IUserContext _userContext;

        public PortfolioHistoryService(AlgoSystemsContext context, ILogger<PortfolioHistoryService> logger,
            IUserContext userContext)
        {
            _context = context;
            _logger = logger;
            _userContext = userContext;
        }

        public async Task<bool> DeleteByIdAsync(int id)
        {
            //string email = _userContext.Email;
            //if (string.IsNullOrEmpty(email) || (email != "admin@algosystems.com.au" && email != "madhu@gmail.com"))
            //{
            //    _logger.LogError("User email is not authorized to delete.");
            //    return false;            
            //}

            var item = await _context.ProductPortfolios.Where(x => x.Id == id).FirstAsync();
            _context.ProductPortfolios.Remove(item);
            _context.SaveChanges();

            return true;
        }

    }
}
