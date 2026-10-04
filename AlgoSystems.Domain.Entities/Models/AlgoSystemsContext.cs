using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace AlgoSystems.Domain.Entities.Models;

public partial class AlgoSystemsContext : DbContext
{
    public AlgoSystemsContext()
    {
    }

    public AlgoSystemsContext(DbContextOptions<AlgoSystemsContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AlgoPortfolio> AlgoPortfolios { get; set; }

    public virtual DbSet<EodhdSymbol> EodhdSymbols { get; set; }

    public virtual DbSet<EodhdSymbolDetail> EodhdSymbolDetails { get; set; }

    public virtual DbSet<Nlog> Nlogs { get; set; }

    public virtual DbSet<ProductPortfolio> ProductPortfolios { get; set; }

    public virtual DbSet<ProductScanResult> ProductScanResults { get; set; }

    public virtual DbSet<UserAccessLog> UserAccessLogs { get; set; }

    public virtual DbSet<Watchlist> Watchlists { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=(local);Database=AlgoSystems;Trusted_Connection=True;MultipleActiveResultSets=False;Encrypt=false;TrustServerCertificate=False;Connection Timeout=30");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AlgoPortfolio>(entity =>
        {
            entity.ToTable("AlgoPortfolio", "App");

            entity.Property(e => e.Action)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.BuyReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.CloseDate).HasColumnType("datetime");
            entity.Property(e => e.Comments)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.OpenData).HasColumnType("datetime");
            entity.Property(e => e.OrderStatus)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ScanType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SellReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.Symbol)
                .HasMaxLength(15)
                .IsUnicode(false);
        });

        modelBuilder.Entity<EodhdSymbol>(entity =>
        {
            entity.Property(e => e.Code)
                .IsRequired()
                .HasMaxLength(128)
                .IsUnicode(false);
            entity.Property(e => e.Country)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Currency).HasMaxLength(50);
            entity.Property(e => e.Exchange)
                .HasMaxLength(250)
                .IsUnicode(false);
            entity.Property(e => e.IndustryGroup)
                .HasMaxLength(512)
                .IsUnicode(false);
            entity.Property(e => e.Isin).HasMaxLength(50);
            entity.Property(e => e.Name)
                .HasMaxLength(512)
                .IsUnicode(false);
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<EodhdSymbolDetail>(entity =>
        {
            entity.Property(e => e.AdjustedClose)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Adjusted_Close");
            entity.Property(e => e.Atr)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("ATR");
            entity.Property(e => e.Avgvol14d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Avgvol_14d");
            entity.Property(e => e.Avgvol200d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Avgvol_200d");
            entity.Property(e => e.Avgvol50d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Avgvol_50d");
            entity.Property(e => e.Change).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.ChangeP)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Change_P");
            entity.Property(e => e.Close).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Code)
                .IsRequired()
                .HasMaxLength(50);
            entity.Property(e => e.CreatedDate).HasColumnType("datetime");
            entity.Property(e => e.Ema125)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("EMA125");
            entity.Property(e => e.Ema200d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Ema_200d");
            entity.Property(e => e.Ema21)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("EMA21");
            entity.Property(e => e.Ema50d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Ema_50d");
            entity.Property(e => e.Ema63)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("EMA63");
            entity.Property(e => e.EmacrossOverDate).HasColumnType("datetime");
            entity.Property(e => e.ExchangeShortName)
                .HasMaxLength(250)
                .HasColumnName("Exchange_Short_Name");
            entity.Property(e => e.Hi250d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Hi_250d");
            entity.Property(e => e.High).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Lo250d)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Lo_250d");
            entity.Property(e => e.Low).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Macd)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("MACD");
            entity.Property(e => e.Name).HasMaxLength(250);
            entity.Property(e => e.Open).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.PrevClose)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("Prev_Close");
            entity.Property(e => e.SignalLine).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Type).HasMaxLength(50);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<Nlog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_dbo.Log");

            entity.ToTable("NLog");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Callsite).HasMaxLength(300);
            entity.Property(e => e.Level)
                .IsRequired()
                .HasMaxLength(5)
                .IsUnicode(false);
            entity.Property(e => e.Logged).HasColumnType("datetime");
            entity.Property(e => e.Logger).HasMaxLength(300);
            entity.Property(e => e.MachineName).HasMaxLength(200);
            entity.Property(e => e.Message).IsRequired();
        });

        modelBuilder.Entity<ProductPortfolio>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_IGMarketPortfolio");

            entity.ToTable("ProductPortfolio", "App");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Action)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.BuyReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.CloseDate).HasColumnType("datetime");
            entity.Property(e => e.Comments)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.OpenData).HasColumnType("datetime");
            entity.Property(e => e.OrderStatus)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ScanType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SellReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.Symbol)
                .HasMaxLength(15)
                .IsUnicode(false);
        });

        modelBuilder.Entity<ProductScanResult>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK_AsxScanResult");

            entity.ToTable("ProductScanResult", "App");

            entity.Property(e => e.Atr)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("ATR");
            entity.Property(e => e.Description)
                .HasMaxLength(1000)
                .IsUnicode(false);
            entity.Property(e => e.Exchange)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.OpenPrice).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.ScanDate).HasColumnType("datetime");
            entity.Property(e => e.ScanType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.StopPrice).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Symbol)
                .HasMaxLength(8000)
                .IsUnicode(false);
        });

        modelBuilder.Entity<UserAccessLog>(entity =>
        {
            entity.ToTable("UserAccessLog", "App");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Comments)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.LoggedTime).HasColumnType("datetime");
            entity.Property(e => e.Url)
                .HasMaxLength(4000)
                .IsUnicode(false)
                .HasColumnName("URL");
            entity.Property(e => e.UserName)
                .HasMaxLength(250)
                .IsUnicode(false);
        });

        modelBuilder.Entity<Watchlist>(entity =>
        {
            entity.ToTable("Watchlist", "App");

            entity.Property(e => e.Id).HasColumnName("ID");
            entity.Property(e => e.Atr)
                .HasColumnType("decimal(18, 4)")
                .HasColumnName("ATR");
            entity.Property(e => e.BuyReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.CloseDate).HasColumnType("datetime");
            entity.Property(e => e.ClosePrice).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.Comments)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.OpenData).HasColumnType("datetime");
            entity.Property(e => e.OpenPrice).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.OrderStatus)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.ProfitLoss).HasColumnType("decimal(18, 4)");
            entity.Property(e => e.ScanType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.SellReason)
                .HasMaxLength(5000)
                .IsUnicode(false);
            entity.Property(e => e.StockAction)
                .HasMaxLength(10)
                .IsUnicode(false);
            entity.Property(e => e.StockCode)
                .HasMaxLength(15)
                .IsUnicode(false);
            entity.Property(e => e.StopPrice).HasColumnType("decimal(18, 4)");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
