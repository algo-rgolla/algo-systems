using AlgoSystems.Domain.Entities.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Repositories
{
    public class WatchlistRepository : AlgoBaseRepository, IWatchlistRepository
    {

        public WatchlistRepository(DbContext context) : base(context)
        {
        }

        public IEnumerable<Watchlist> GetAllWatchlist()
        {
            return Context.Watchlists.ToList();
        }

        public Watchlist GetWatchlistById(int id)
        {
            return Context.Watchlists.Where(x => x.Id == id).FirstOrDefault();

        }
    }
}
