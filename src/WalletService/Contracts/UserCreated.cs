namespace Contracts;

/// <summary>
/// DEV NOTE: This contract follows the "Event-Driven" naming convention. In Microservices, 
/// services don't share their internal Databases or Models, but they share Contracts. This 
/// is the "shape" of the message.
/// 1. Why no "I" prefix? Events are facts (Nouns in past tense). Naming it 'UserCreated' 
///    clearly describes the event that occurred, whereas 'IUserCreated' describes the code 
///    structure.
/// 2. Why a shared namespace? MassTransit routes messages based on the Full Type Name 
///    (Namespace + Type). Using a unified namespace ensures the Publisher and Consumer can 
///    'find' each other.
/// </summary>
public interface UserCreated
{
    string UserId { get; }
    string Email { get; }
    string FullName { get; }
}