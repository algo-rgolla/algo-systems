using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AlgoSystems.Domain.Entities.Migrations
{
    public partial class ReferenceData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "Code",
                table: "SectorType",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedDate", "ModifiedDate" },
                values: new object[] { new DateTime(2022, 9, 17, 18, 53, 49, 604, DateTimeKind.Local).AddTicks(1680), new DateTime(2022, 9, 17, 18, 53, 49, 626, DateTimeKind.Local).AddTicks(2405) });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "Code",
                table: "SectorType",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedDate", "ModifiedDate" },
                values: new object[] { new DateTime(2022, 9, 10, 14, 4, 48, 685, DateTimeKind.Local).AddTicks(8239), new DateTime(2022, 9, 10, 14, 4, 48, 694, DateTimeKind.Local).AddTicks(3773) });
        }
    }
}
