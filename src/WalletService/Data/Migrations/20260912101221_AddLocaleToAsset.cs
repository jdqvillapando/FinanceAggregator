using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WalletService.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddLocaleToAsset : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Locale",
                schema: "wallet_schema",
                table: "Assets",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Locale",
                schema: "wallet_schema",
                table: "Assets");
        }
    }
}
