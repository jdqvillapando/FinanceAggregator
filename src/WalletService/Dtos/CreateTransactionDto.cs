using System.ComponentModel.DataAnnotations;
using WalletService.Models; // For your TransactionType enum definition

namespace WalletService.Dtos;

public class CreateTransactionDto
{
    [Required(ErrorMessage = "Transaction amount is required.")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Transaction amount must be greater than zero.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Transaction type classification is required.")]
    [EnumDataType(typeof(TransactionType), ErrorMessage = "Invalid transaction type specified.")]
    public TransactionType Type { get; set; } // Matches your enum (Deposit / Withdrawal)

    [MaxLength(250, ErrorMessage = "Description text cannot exceed 250 characters.")]
    public string Description { get; set; } = string.Empty;
}