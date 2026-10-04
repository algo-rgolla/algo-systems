using AlgoSystems.Application.Repositories;
using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Repository.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Repository.Repositories
{
    public class LookupRepository : AlgoBaseRepository, ILookupRepository
    {
        public LookupRepository(DbContext context) : base(context)
        {
        }

        //public string GetSectorById(int sectorId)
        //{
        //    var sector = Context.SectorTypes.Where(x => x.Id == sectorId).FirstOrDefault();
            
        //    return sector.Name;
        //}
    }
}
