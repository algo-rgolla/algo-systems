using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AlgoSystems.Domain.Entities.Migrations
{
    public partial class Initial : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "HangFire");

            migrationBuilder.EnsureSchema(
                name: "App");

            migrationBuilder.EnsureSchema(
                name: "Code");

            migrationBuilder.CreateTable(
                name: "AggregatedCounter",
                schema: "HangFire",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<long>(type: "bigint", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_CounterAggregated", x => x.Key);
                });

            migrationBuilder.CreateTable(
                name: "Counter",
                schema: "HangFire",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<int>(type: "int", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                });

            migrationBuilder.CreateTable(
                name: "Exchange",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "varchar(512)", unicode: false, maxLength: 512, nullable: true),
                    Suffix = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Country = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false),
                    Currency = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false),
                    Advances = table.Column<int>(type: "int", nullable: false),
                    Declines = table.Column<int>(type: "int", nullable: false),
                    LastTradeDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Timezone = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedBy = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Exchange", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Hash",
                schema: "HangFire",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Field = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpireAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_Hash", x => new { x.Key, x.Field });
                });

            migrationBuilder.CreateTable(
                name: "History",
                schema: "App",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CommunicationId = table.Column<int>(type: "int", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    NoteCreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_History", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "IndustryGroup",
                schema: "Code",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IndustryGroup", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Job",
                schema: "HangFire",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StateId = table.Column<long>(type: "bigint", nullable: true),
                    StateName = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    InvocationData = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Arguments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Job", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "JobQueue",
                schema: "HangFire",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Queue = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    JobId = table.Column<long>(type: "bigint", nullable: false),
                    FetchedAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_JobQueue", x => new { x.Queue, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "List",
                schema: "HangFire",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExpireAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_List", x => new { x.Key, x.Id });
                });

            migrationBuilder.CreateTable(
                name: "Product",
                schema: "App",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Symbol = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: false),
                    Exchange = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ExchangeSymbolId = table.Column<int>(type: "int", nullable: true),
                    Name = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    StockDate = table.Column<DateTime>(type: "date", nullable: true),
                    OpenPrice = table.Column<double>(type: "float", nullable: true),
                    HighPrice = table.Column<double>(type: "float", nullable: true),
                    LowPrice = table.Column<double>(type: "float", nullable: true),
                    Close = table.Column<double>(type: "float", nullable: true),
                    Volume = table.Column<long>(type: "bigint", nullable: true),
                    OpenIntrest = table.Column<long>(type: "bigint", nullable: true),
                    Previous = table.Column<double>(type: "float", nullable: true),
                    Change = table.Column<double>(type: "float", nullable: true),
                    ChangePercent = table.Column<double>(type: "float", nullable: true),
                    Big = table.Column<double>(type: "float", nullable: true),
                    Ask = table.Column<double>(type: "float", nullable: true),
                    PreviousClose = table.Column<double>(type: "float", nullable: true),
                    NextOpen = table.Column<double>(type: "float", nullable: true),
                    ChartUrl = table.Column<string>(type: "varchar(max)", unicode: false, nullable: true),
                    Industry = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    Sector = table.Column<string>(type: "varchar(500)", unicode: false, maxLength: 500, nullable: true),
                    Shares = table.Column<long>(type: "bigint", nullable: true),
                    MarketCap = table.Column<long>(type: "bigint", nullable: true),
                    PE = table.Column<double>(type: "float", nullable: true),
                    EPS = table.Column<double>(type: "float", nullable: true),
                    WeekChange = table.Column<double>(type: "float", nullable: true),
                    MonthChange = table.Column<double>(type: "float", nullable: true),
                    YearChange = table.Column<double>(type: "float", nullable: true),
                    AvgWeekVolume = table.Column<double>(type: "float", nullable: true),
                    AvgMonthVolume = table.Column<double>(type: "float", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: false),
                    UpdatedBy = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: false),
                    ISINCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    DescriptionFull = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    BidPrice = table.Column<double>(type: "float", nullable: true),
                    OfferPrice = table.Column<double>(type: "float", nullable: true),
                    PreviousDayPercentageChange = table.Column<double>(type: "float", nullable: true),
                    YearHighPrice = table.Column<double>(type: "float", nullable: true),
                    LastTradePrice = table.Column<double>(type: "float", nullable: true),
                    YearHighDate = table.Column<DateTime>(type: "date", nullable: true),
                    LastTradeDate = table.Column<DateTime>(type: "date", nullable: true),
                    YearLowPrice = table.Column<double>(type: "float", nullable: true),
                    YearLowDate = table.Column<DateTime>(type: "date", nullable: true),
                    YearOpenPrice = table.Column<double>(type: "float", nullable: true),
                    YearOpenDate = table.Column<DateTime>(type: "date", nullable: true),
                    YearChangePrice = table.Column<double>(type: "float", nullable: true),
                    YearChangeInPercentage = table.Column<double>(type: "float", nullable: true),
                    AverageDailyVolumn = table.Column<long>(type: "bigint", nullable: true),
                    AnnualDividentYield = table.Column<double>(type: "float", nullable: true),
                    DeprecatedMarketCap = table.Column<long>(type: "bigint", nullable: true),
                    DeprecatedNumberOfShares = table.Column<long>(type: "bigint", nullable: true),
                    Suspended = table.Column<bool>(type: "bit", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Product", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProductPortfolio",
                schema: "App",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Symbol = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: true),
                    Action = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    OpenData = table.Column<DateTime>(type: "datetime", nullable: true),
                    OpenPrice = table.Column<double>(type: "float", nullable: true),
                    StopPrice = table.Column<double>(type: "float", nullable: true),
                    OrderStatus = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Volume = table.Column<int>(type: "int", nullable: true),
                    CloseDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ClosePrice = table.Column<double>(type: "float", nullable: true),
                    ScanType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ProfitLoss = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true),
                    BuyReason = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true),
                    SellReason = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductPortfolio", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "ProductScanResult",
                schema: "App",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ScanDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ScanType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Symbol = table.Column<string>(type: "varchar(8000)", unicode: false, maxLength: 8000, nullable: true),
                    Description = table.Column<string>(type: "varchar(1000)", unicode: false, maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductScanResult", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Schema",
                schema: "HangFire",
                columns: table => new
                {
                    Version = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_Schema", x => x.Version);
                });

            migrationBuilder.CreateTable(
                name: "SectorIndustryMapper",
                schema: "Code",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SectorId = table.Column<int>(type: "int", nullable: false),
                    IndustryGroupId = table.Column<int>(type: "int", nullable: false),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectorIndustryMapper", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SectorType",
                schema: "Code",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Name = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    CreatedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    ModifiedDate = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(getdate())"),
                    ModifiedBy = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectorType", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Server",
                schema: "HangFire",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LastHeartbeat = table.Column<DateTime>(type: "datetime", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Server", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Set",
                schema: "HangFire",
                columns: table => new
                {
                    Key = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Score = table.Column<double>(type: "float", nullable: false),
                    ExpireAt = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_Set", x => new { x.Key, x.Value });
                });

            migrationBuilder.CreateTable(
                name: "Watchlist",
                schema: "App",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    StockCode = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: true),
                    StockAction = table.Column<string>(type: "varchar(10)", unicode: false, maxLength: 10, nullable: true),
                    OpenData = table.Column<DateTime>(type: "datetime", nullable: true),
                    OpenPrice = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    StopPrice = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    OrderStatus = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    Volume = table.Column<int>(type: "int", nullable: true),
                    CloseDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    ClosePrice = table.Column<decimal>(type: "decimal(4,2)", nullable: true),
                    ScanType = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    ProfitLoss = table.Column<int>(type: "int", nullable: true),
                    Comments = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true),
                    BuyReason = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true),
                    SellReason = table.Column<string>(type: "varchar(5000)", unicode: false, maxLength: 5000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Watchlist", x => x.ID);
                });

            migrationBuilder.CreateTable(
                name: "ExchangeSymbols",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ExchangeId = table.Column<int>(type: "int", nullable: true),
                    ExchangeCode = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: false),
                    Code = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false),
                    Name = table.Column<string>(type: "varchar(512)", unicode: false, maxLength: 512, nullable: true),
                    LongName = table.Column<string>(type: "varchar(1024)", unicode: false, maxLength: 1024, nullable: true),
                    DateTime = table.Column<DateTime>(type: "datetime", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    UpdatedBy = table.Column<string>(type: "varchar(128)", unicode: false, maxLength: 128, nullable: false),
                    IndustryGroup = table.Column<string>(type: "varchar(512)", unicode: false, maxLength: 512, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExchangeSymbols", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExchangeSymbols_Exchange",
                        column: x => x.ExchangeId,
                        principalTable: "Exchange",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "JobParameter",
                schema: "HangFire",
                columns: table => new
                {
                    JobId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(40)", maxLength: 40, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_JobParameter", x => new { x.JobId, x.Name });
                    table.ForeignKey(
                        name: "FK_HangFire_JobParameter_Job",
                        column: x => x.JobId,
                        principalSchema: "HangFire",
                        principalTable: "Job",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "State",
                schema: "HangFire",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    JobId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: false),
                    Data = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HangFire_State", x => new { x.JobId, x.Id });
                    table.ForeignKey(
                        name: "FK_HangFire_State_Job",
                        column: x => x.JobId,
                        principalSchema: "HangFire",
                        principalTable: "Job",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProductHistory",
                schema: "App",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    Symbol = table.Column<string>(type: "varchar(15)", unicode: false, maxLength: 15, nullable: true),
                    Exchange = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    StockDate = table.Column<DateTime>(type: "date", nullable: true),
                    StockOpen = table.Column<double>(type: "float", nullable: true),
                    StockHigh = table.Column<double>(type: "float", nullable: true),
                    StockLow = table.Column<double>(type: "float", nullable: true),
                    StockClose = table.Column<double>(type: "float", nullable: true),
                    StockChange = table.Column<double>(type: "float", nullable: true),
                    StockChangePercent = table.Column<double>(type: "float", nullable: true),
                    Volume = table.Column<double>(type: "float", nullable: true),
                    EMA9 = table.Column<double>(type: "float", nullable: true),
                    EMA21 = table.Column<double>(type: "float", nullable: true),
                    EMA63 = table.Column<double>(type: "float", nullable: true),
                    EMACrossoverDate = table.Column<DateTime>(type: "date", nullable: true),
                    ATR = table.Column<double>(type: "float", nullable: true),
                    MACDLine = table.Column<double>(type: "float", nullable: true),
                    SignalLine = table.Column<double>(type: "float", nullable: true),
                    MACDHistogram = table.Column<double>(type: "float", nullable: true),
                    TenDayHigh = table.Column<double>(type: "float", nullable: true),
                    TenDayLow = table.Column<double>(type: "float", nullable: true),
                    AO = table.Column<double>(type: "float", nullable: true),
                    AvgVolume52Day = table.Column<int>(type: "int", nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    UpdatedBy = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductHistory_ProductHistory",
                        column: x => x.ProductId,
                        principalSchema: "App",
                        principalTable: "Product",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ProductAnnouncement",
                schema: "App",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductId = table.Column<int>(type: "int", nullable: false),
                    DocumentDate = table.Column<DateTime>(type: "smalldatetime", nullable: true),
                    IsPriceSensitive = table.Column<bool>(type: "bit", nullable: false),
                    HeadlineDescription = table.Column<string>(type: "varchar(100)", unicode: false, maxLength: 100, nullable: true),
                    NumberOfPages = table.Column<short>(type: "smallint", nullable: true),
                    IsPDFFormat = table.Column<bool>(type: "bit", nullable: false),
                    Url = table.Column<string>(type: "varchar(255)", unicode: false, maxLength: 255, nullable: true),
                    CreatedDate = table.Column<DateTime>(type: "datetime", nullable: false, defaultValueSql: "(getdate())"),
                    UpdatedDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedBy = table.Column<string>(type: "varchar(50)", unicode: false, maxLength: 50, nullable: true),
                    RowVersion = table.Column<byte[]>(type: "rowversion", rowVersion: true, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductAnnouncement", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProductAnnouncement_ExchangeSymbols",
                        column: x => x.ProductId,
                        principalTable: "ExchangeSymbols",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_AggregatedCounter_ExpireAt",
                schema: "HangFire",
                table: "AggregatedCounter",
                column: "ExpireAt",
                filter: "([ExpireAt] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "CX_HangFire_Counter",
                schema: "HangFire",
                table: "Counter",
                column: "Key")
                .Annotation("SqlServer:Clustered", true);

            migrationBuilder.CreateIndex(
                name: "IX_ExchangeSymbols_ExchangeId",
                table: "ExchangeSymbols",
                column: "ExchangeId");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Hash_ExpireAt",
                schema: "HangFire",
                table: "Hash",
                column: "ExpireAt",
                filter: "([ExpireAt] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Job_ExpireAt",
                schema: "HangFire",
                table: "Job",
                column: "ExpireAt",
                filter: "([ExpireAt] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Job_StateName",
                schema: "HangFire",
                table: "Job",
                column: "StateName",
                filter: "([StateName] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_List_ExpireAt",
                schema: "HangFire",
                table: "List",
                column: "ExpireAt",
                filter: "([ExpireAt] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_ProductAnnouncement_ProductId",
                schema: "App",
                table: "ProductAnnouncement",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductHistory_ProductId",
                schema: "App",
                table: "ProductHistory",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Server_LastHeartbeat",
                schema: "HangFire",
                table: "Server",
                column: "LastHeartbeat");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Set_ExpireAt",
                schema: "HangFire",
                table: "Set",
                column: "ExpireAt",
                filter: "([ExpireAt] IS NOT NULL)");

            migrationBuilder.CreateIndex(
                name: "IX_HangFire_Set_Score",
                schema: "HangFire",
                table: "Set",
                columns: new[] { "Key", "Score" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AggregatedCounter",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "Counter",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "Hash",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "History",
                schema: "App");

            migrationBuilder.DropTable(
                name: "IndustryGroup",
                schema: "Code");

            migrationBuilder.DropTable(
                name: "JobParameter",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "JobQueue",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "List",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "ProductAnnouncement",
                schema: "App");

            migrationBuilder.DropTable(
                name: "ProductHistory",
                schema: "App");

            migrationBuilder.DropTable(
                name: "ProductPortfolio",
                schema: "App");

            migrationBuilder.DropTable(
                name: "ProductScanResult",
                schema: "App");

            migrationBuilder.DropTable(
                name: "Schema",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "SectorIndustryMapper",
                schema: "Code");

            migrationBuilder.DropTable(
                name: "SectorType",
                schema: "Code");

            migrationBuilder.DropTable(
                name: "Server",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "Set",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "State",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "Watchlist",
                schema: "App");

            migrationBuilder.DropTable(
                name: "ExchangeSymbols");

            migrationBuilder.DropTable(
                name: "Product",
                schema: "App");

            migrationBuilder.DropTable(
                name: "Job",
                schema: "HangFire");

            migrationBuilder.DropTable(
                name: "Exchange");
        }
    }
}
