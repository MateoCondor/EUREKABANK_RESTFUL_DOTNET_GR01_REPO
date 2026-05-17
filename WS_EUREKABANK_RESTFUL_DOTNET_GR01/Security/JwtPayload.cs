namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security
{
    public class JwtPayload
    {
        public string Username { get; }
        public string Role { get; }
        public long ExpiresAt { get; }

        public JwtPayload(string username, string role, long expiresAt)
        {
            Username = username;
            Role = role;
            ExpiresAt = expiresAt;
        }
    }
}
