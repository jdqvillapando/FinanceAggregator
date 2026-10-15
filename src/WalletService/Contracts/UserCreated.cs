using MassTransit;


namespace FinanceAggregator.Contracts;

/// <remarks>
/// DEV NOTE: This contract follows the "Event-Driven" naming convention. In Microservices, 
/// services don't share their internal Databases or Models, but they share Contracts. This 
/// is the "shape" of the message.
/// <list type="number">
/// <item>
/// <term>
/// Why no "I" prefix? 
/// </term>
/// <description>
/// Events are facts (Nouns in past tense). Naming it 'UserCreated' 
/// clearly describes the event that occurred, whereas 'IUserCreated' describes the code 
/// structure.
/// </description>
/// </item>
/// <item>
/// <term>
/// Why a shared namespace? 
/// </term>
/// <description>
/// MassTransit routes messages based on the Full Type Name 
/// (Namespace + Type). Using a unified namespace ensures the Publisher and Consumer can 
/// 'find' each other.
/// </description>
/// </item>
/// </list>
/// </remarks>
[EntityName("UserCreated")]
public interface UserCreated
{
    string UserId { get; }
    string Email { get; }
    string FullName { get; }
}