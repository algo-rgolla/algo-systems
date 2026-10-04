using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Repositories
{
    public abstract class AlgoBaseRepository : BaseRepository<AlgoSystemsContext>
    {
        public AlgoBaseRepository(DbContext context) : base(context)
        {
            // Algo Repository
        }
    }
}
