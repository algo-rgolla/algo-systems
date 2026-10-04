using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace AlgoSystems.Domain.Entities.Migrations
{
    public partial class Extend_Identity_User : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Mobile",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.UpdateData(
                schema: "Code",
                table: "SectorType",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedDate", "ModifiedDate" },
                values: new object[] { new DateTime(2022, 10, 3, 23, 26, 40, 197, DateTimeKind.Local).AddTicks(5106), new DateTime(2022, 10, 3, 23, 26, 40, 208, DateTimeKind.Local).AddTicks(815) });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mobile",
                table: "AspNetUsers");

            migrationBuilder.UpdateData(
                schema: "Code",
                table: "SectorType",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "CreatedDate", "ModifiedDate" },
                values: new object[] { new DateTime(2022, 9, 17, 19, 32, 55, 97, DateTimeKind.Local).AddTicks(6511), new DateTime(2022, 9, 17, 19, 32, 55, 102, DateTimeKind.Local).AddTicks(6) });
        }
    }
}
