using FluentValidation;
using WalletService.Dtos;


namespace WalletService.Validators;

public class CreateWalletDtoValidator : AbstractValidator<CreateWalletDto>
{
    public CreateWalletDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Wallet name is required.")
            .MinimumLength(3).WithMessage("Wallet name must be at least 3 characters long.")
            .MaximumLength(50).WithMessage("Wallet name cannot exceed 50 characters.");
    }
}