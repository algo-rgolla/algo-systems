using AlgoSystems.Application.Common;
using AlgoSystems.Domain.Entities.Models;
using AlgoSystems.Common.Interfaces;
using System.Threading.Tasks;
using System;

namespace AlgoSystems.Application.Services
{
    public abstract class BaseApiService
    {
        protected readonly AlgoSystemsContext _dbContext;
        protected readonly IUserContext _userContext;

        protected BaseApiService(AlgoSystemsContext dbContext, IUserContext userContext)
        {
            _dbContext = dbContext;
            _userContext = userContext;
        }

        /// <summary>
        /// Logs user details before executing the business logic.
        /// </summary>
        /// <param name="action">The business logic action to execute.</param>
        /// <returns>A task representing the asynchronous operation.</returns>
        protected async Task ExecuteWithLoggingAsync(Func<Task> action)
        {
            // Log user details
            //await Utils.LogUserDetails(_dbContext, _userContext);

            // Execute the business logic
            await action();
        }

        /// <summary>
        /// Logs user details before executing the business logic and returns a result.
        /// </summary>
        /// <typeparam name="T">The type of the result.</typeparam>
        /// <param name="action">The business logic action to execute.</param>
        /// <returns>The result of the business logic.</returns>
        protected async Task<T> ExecuteWithLoggingAsync<T>(Func<Task<T>> action)
        {
            // Log user details
            //await Utils.LogUserDetails(_dbContext, _userContext);

            // Execute the business logic and return the result
            return await action();
        }
    }
}