using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.EntityFrameworkCore.Storage;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Repositories
{
    internal interface IBaseRepository
    {
        void CreateEntity<T>(T dbEntity) where T : class;
        void UpdateEntity<T>(T dbEntity) where T : class;
        void RemoveEntity<T>(T dbEntity) where T : class;
        void SaveChanges();

        IDbContextTransaction BeginTransaction();
        IDbContextTransaction BeginTransaction(IsolationLevel isolation);

        void EndTransaction(IDbContextTransaction transaction, bool commitChanges);

        Task SaveChangesAsync();
        IQueryable<T> GetFromDatabase<T>() where T : class;
    }
}