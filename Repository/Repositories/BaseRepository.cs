using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Repositories
{
    public abstract class BaseRepository<TContext> : IDisposable, IBaseRepository
        where TContext : DbContext
    {
        private DbContext _dbContext;
        //protected ILogger _logger;

        public BaseRepository(DbContext dbContext)
        {
            _dbContext = dbContext;
            //_logger = logger;
        }

        public TContext Context
        {
            get
            {
                return _dbContext as TContext;
            }
        }

        public IDbContextTransaction BeginTransaction()
        {
            return Context.Database.BeginTransaction(IsolationLevel.ReadUncommitted);
        }

        public IDbContextTransaction BeginTransaction(IsolationLevel isolation)
        {
            return Context.Database.BeginTransaction(isolation);
        }

        public void CreateEntity<T>(T dbEntity) where T : class
        {
            Context.Set<T>().Add(dbEntity);
        }

        public void Dispose()
        {
            if (Context != null)
            {
                //Context.SaveChanges();
                Context.Dispose();
                _dbContext = null;
            }
        }

        public void EndTransaction(IDbContextTransaction transaction, bool commitChanges)
        {
            if (Context.Database.GetDbConnection().State != ConnectionState.Closed)
            {
                if (commitChanges)
                {
                    transaction.Commit();
                }
                else
                {
                    transaction.Rollback();
                }
            }
        }

        public IQueryable<T> GetFromDatabase<T>() where T : class
        {
            return Context.Set<T>();
        }

        public void RemoveEntity<T>(T dbEntity) where T : class
        {
            Context.Set<T>().Remove(dbEntity);
            Context.Entry(dbEntity).State = EntityState.Modified;
        }

        public void SaveChanges()
        {
            Context.SaveChanges();
        }

        public async Task SaveChangesAsync()
        {
            await Context.SaveChangesAsync();
        }

        public void UpdateEntity<T>(T dbEntity) where T : class
        {
            Context.Set<T>().Attach(dbEntity);
            Context.Entry(dbEntity).State = EntityState.Modified;
        }
    }
}
