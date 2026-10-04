using AlgoSystems.Domain.Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Repositories
{
    public interface IWatchlistRepository
    {
        Watchlist GetWatchlistById(int Id);
        IEnumerable<Watchlist> GetAllWatchlist();
    }
}
