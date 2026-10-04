//using Microsoft.EntityFrameworkCore.Query;
//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Linq.Expressions;
//using System.Threading.Tasks;

//namespace AlgoSystems.Application.Repositories
//{
//    public interface IGenericRepository<TEntity> where TEntity : class
//    {
//        string EntityName { get; }

//        Task<IEnumerable<TEntity>> All();
//        Task<IEnumerable<TEntity>> AllInclude(params Expression<Func<TEntity, object>>[] includeProperties);
//        Task<IEnumerable<TEntity>> AllChildInclude
//       (Func<IQueryable<TEntity>, IIncludableQueryable<TEntity, object>> includeProperties);
//        void Delete(int id);
//        void Delete(TEntity entity);
//        IEnumerable<TEntity> FindBy(Expression<Func<TEntity, bool>> predicate, bool tracking = true);
//        IEnumerable<TEntity> FindByInclude(Expression<Func<TEntity, bool>> predicate, bool tracking, params Expression<Func<TEntity, object>>[] includeProperties);
//        IEnumerable<TEntity> FindByInclude(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includeProperties);
//        TEntity FindByKey(int id);
//        TEntity Get(Expression<Func<TEntity, bool>> predicate, bool tracking = true, params Expression<Func<TEntity, object>>[] includeProperties);
//        int GetTotalRecords(Expression<Func<TEntity, bool>> filter = null);
//        void Insert(TEntity entity);
//        void SaveChanges();
//        IQueryable<TEntity> Search(Expression<Func<TEntity, bool>> filter = null, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy = null, int? page = null, int? pageSize = null, bool tracking = true, params Expression<Func<TEntity, object>>[] includes);
//        void Update(TEntity entity);
//    }
//}