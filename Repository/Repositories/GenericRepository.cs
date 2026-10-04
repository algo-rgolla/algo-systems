//using AlgoSystems.Domain.Entities.Models;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.EntityFrameworkCore.Query;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Threading.Tasks;

//namespace AlgoSystems.Application.Repositories
//{
//    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
//    {
//        internal AlgoSystemsContext _context;
//        internal DbSet<TEntity> _dbSet;

//        public GenericRepository(AlgoSystemsContext context)
//        {
//            _context = context;
//            _dbSet = context.Set<TEntity>();
//        }

//        public async Task<IEnumerable<TEntity>> All()
//        {
//            return await _dbSet.AsNoTracking().ToListAsync();
//        }

//        public async Task<IEnumerable<TEntity>> AllChildInclude
//       (Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> includeProperties)
//        {
//            IQueryable<TEntity> queryable = GetDBSet(false);
//            return await includeProperties((queryable)).ToListAsync();
//        }
        
//        public IEnumerable<TEntity> FindBy(Expression<Func<TEntity, bool>> predicate, bool tracking = true)
//        {
//            IEnumerable<TEntity> results = GetDBSet(tracking)
//              .Where(predicate).ToList();
//            return results;
//        }

//        public void Insert(TEntity entity)
//        {
//            _dbSet.Add(entity);
//            //_context.SaveChanges();
//        }

//        public void Update(TEntity entity)
//        {
//            _dbSet.Attach(entity);
//            _context.Entry(entity).State = EntityState.Modified;
//            //_context.SaveChanges();
//        }

//        public void Delete(TEntity entity)
//        {
//            _dbSet.Remove(entity);
//            //_context.SaveChanges();
//        }

//        public void SaveChanges()
//        {
//            _context.SaveChanges();
//        }

//        /// <summary>
//        /// Returns the name of the entity (for record not found exception)
//        /// </summary>
//        public string EntityName { get { return typeof(TEntity).Name; } }

//        private IQueryable<TEntity> GetDBSet(bool tracking)
//        {
//            if (tracking)
//            {
//                return _dbSet;
//            }
//            else
//            {
//                return _dbSet.AsNoTracking();
//            }
//        }

//        public Task<IEnumerable<TEntity>> AllInclude(params Expression<Func<TEntity, object>>[] includeProperties)
//        {
//            throw new NotImplementedException();
//        }

//        public void Delete(int id)
//        {
//            throw new NotImplementedException();
//        }

//        public IEnumerable<TEntity> FindByInclude(Expression<Func<TEntity, bool>> predicate, bool tracking, params Expression<Func<TEntity, object>>[] includeProperties)
//        {
//            throw new NotImplementedException();
//        }

//        public IEnumerable<TEntity> FindByInclude(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includeProperties)
//        {
//            throw new NotImplementedException();
//        }

//        public TEntity FindByKey(int id)
//        {
//            throw new NotImplementedException();
//        }

//        public TEntity Get(Expression<Func<TEntity, bool>> predicate, bool tracking = true, params Expression<Func<TEntity, object>>[] includeProperties)
//        {
//            throw new NotImplementedException();
//        }

//        public int GetTotalRecords(Expression<Func<TEntity, bool>> filter = null)
//        {
//            throw new NotImplementedException();
//        }

//        public IQueryable<TEntity> Search(Expression<Func<TEntity, bool>> filter = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null, int? page = null, int? pageSize = null, bool tracking = true, params Expression<Func<TEntity, object>>[] includes)
//        {
//            throw new NotImplementedException();
//        }
//    }
//}
