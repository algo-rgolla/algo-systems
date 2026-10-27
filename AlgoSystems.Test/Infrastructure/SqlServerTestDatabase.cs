using AlgoSystems.Domain.Entities.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace AlgoSystems.Test.Infrastructure
{
    /// <summary>
    /// A throwaway SQL Server database created from the EF model. Real SQL Server is used rather than an
    /// in-memory provider so collation, decimal scale and ExecuteDelete behave as they do in production.
    /// Override the server with the ALGOSYSTEMS_TEST_SQLSERVER environment variable.
    /// </summary>
    public sealed class SqlServerTestDatabase
    {
        private const string DefaultServer = "Server=(local);Trusted_Connection=True;TrustServerCertificate=True;Encrypt=False";
        public const string DatabaseNamePrefix = "AlgoSystemsTest_";

        private readonly string _connectionString;

        private SqlServerTestDatabase(string connectionString)
        {
            _connectionString = connectionString;
        }

        public static SqlServerTestDatabase Create()
        {
            var server = Environment.GetEnvironmentVariable("ALGOSYSTEMS_TEST_SQLSERVER") ?? DefaultServer;
            var builder = new SqlConnectionStringBuilder(server)
            {
                InitialCatalog = DatabaseNamePrefix + Guid.NewGuid().ToString("N"),
                ConnectTimeout = 5,
            };

            var database = new SqlServerTestDatabase(builder.ConnectionString);
            using var context = database.CreateContext();
            try
            {
                context.Database.EnsureCreated();
            }
            catch (SqlException ex)
            {
                Assert.Ignore($"SQL Server is not available for integration tests ({ex.Message}). Set ALGOSYSTEMS_TEST_SQLSERVER to run them.");
            }

            return database;
        }

        public AlgoSystemsContext CreateContext(params IInterceptor[] interceptors)
        {
            var options = new DbContextOptionsBuilder<AlgoSystemsContext>()
                .UseSqlServer(_connectionString)
                .AddInterceptors(interceptors)
                .Options;
            var context = new TestAlgoSystemsContext(options);

            // Guard against ever writing to a real database if the context's configuration changes.
            var databaseName = new SqlConnectionStringBuilder(context.Database.GetConnectionString()).InitialCatalog;
            if (!databaseName.StartsWith(DatabaseNamePrefix, StringComparison.Ordinal))
            {
                context.Dispose();
                throw new InvalidOperationException($"Refusing to use database '{databaseName}' for tests.");
            }

            return context;
        }

        public async Task ResetAsync()
        {
            await using var context = CreateContext();
            await context.Watchlists.ExecuteDeleteAsync();
            await context.ProductScanResults.ExecuteDeleteAsync();
            await context.EodhdSymbolDetails.ExecuteDeleteAsync();
            await context.EodhdSymbols.ExecuteDeleteAsync();
        }

        public void Drop()
        {
            using var context = CreateContext();
            context.Database.EnsureDeleted();
        }

        private sealed class TestAlgoSystemsContext : AlgoSystemsContext
        {
            public TestAlgoSystemsContext(DbContextOptions<AlgoSystemsContext> options) : base(options)
            {
            }

            // Re-scaffolding regenerates an OnConfiguring that replaces any configured connection string with the
            // development database's, so it must never run here.
            protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
            {
            }
        }
    }
}
