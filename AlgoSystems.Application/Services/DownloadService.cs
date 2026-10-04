using AlgoSystems.Application.Common;
using AlgoSystems.Application.Interfaces;
using AlgoSystems.Application.Models;
using AlgoSystems.Common;
using AlgoSystems.Common.Helpers;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Services
{
    public class DownloadService : IDownloadService
    {
        private readonly AlgoSystemsContext _dbContext;
        public DownloadService(AlgoSystemsContext dbContext)
        {
            _dbContext = dbContext;
        }

        //public IEnumerable<SectorType> GetAllSectorTypes()
        //{
        //    return (IEnumerable<SectorType>)_dbContext.SectorTypes.ToList();
        //}

        public decimal? ToDecimal(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value == "∞%")
            {
                return null;
            }
            else
            {
                return Convert.ToDecimal(value.Replace("%", ""));
            }
        }

        public double? ToDouble(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }
            else
            {
                return Convert.ToDouble(value.Replace("%", ""));
            }
        }
    }
}
