using System.Threading;
using System.Threading.Tasks;

namespace AlgoSystems.Application.Interfaces
{
    /// <summary>The daily scan batches. The API reads scan results through <c>ProductScans.ProductScanService</c>.</summary>
    public interface IScanBusinessLogic
    {
        public Task<bool> ProcessEodProductScans(CancellationToken cancellationToken = default);
        public Task<bool> ProcessUSProductScans(CancellationToken cancellationToken = default);
    }
}
