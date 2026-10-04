using AlgoSystems.Application.Interfaces;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class CommonService : ICommonService
    {
        private readonly AlgoSystemsContext _dbContext;
        public CommonService(AlgoSystemsContext dbContext)
        {
            _dbContext = dbContext;
        }
    }
}
