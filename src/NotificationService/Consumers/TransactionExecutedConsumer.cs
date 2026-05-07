using System;
using System.Threading.Tasks;
using MassTransit;
using NotificationService.Contracts;


namespace NotificationService.Consumers;

public class TransactionExecutedConsumer : IConsumer<TransactionExecuted>
{
    public async Task Consume(ConsumeContext<TransactionExecuted> context)
    {
        var message = context.Message;

        // In a real production system, you would integrate SendGrid, Twilio, or an SMTP client here.
        // For our portfolio simulation, we will output a structured real-time system audit log.
        Console.ForegroundColor = ConsoleColor.Cyan;
        Console.WriteLine($"[NOTIFICATION SERVICE] Alert: Processing Transaction Receipt!");
        Console.WriteLine($"-> Transaction ID: {message.TransactionId}");
        Console.WriteLine($"-> Wallet impacted: {message.WalletId}");
        Console.WriteLine($"-> Amount: {message.Amount} | Type: {message.TransactionType}");
        Console.WriteLine($"-> Dispatched At: {message.Timestamp}");
        Console.ResetColor();

        await Task.CompletedTask;
    }
}
