using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AlgoSystems.Domain.Entities.Migrations
{
    public partial class SeedReferenceData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "Code",
                table: "SectorType",
                columns: new[] { "Id", "Code", "CreatedBy", "CreatedDate", "Description", "DisplayOrder", "IsDeleted", "ModifiedBy", "ModifiedDate", "Name" },
                values: new object[] { 1, "XEJ", "Admin", new DateTime(2022, 9, 10, 14, 4, 48, 685, DateTimeKind.Local).AddTicks(8239), "Energy", null, false, "Admin", new DateTime(2022, 9, 10, 14, 4, 48, 694, DateTimeKind.Local).AddTicks(3773), "Energy" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "Code",
                table: "SectorType",
                keyColumn: "Id",
                keyValue: 1);
        }
    }
}
