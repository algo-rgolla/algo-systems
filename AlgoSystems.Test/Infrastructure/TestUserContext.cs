using AlgoSystems.Common.Interfaces;

namespace AlgoSystems.Test.Infrastructure
{
    public sealed class TestUserContext : IUserContext
    {
        public TestUserContext(string? email)
        {
            Email = email;
        }

        public string? UserId => "test-user";
        public string? Email { get; }
        public string? RequestUrl => "/test";
    }
}
