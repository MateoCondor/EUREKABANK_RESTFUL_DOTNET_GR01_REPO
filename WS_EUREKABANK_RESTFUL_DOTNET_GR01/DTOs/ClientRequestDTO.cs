using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class ClientRequestDTO
    {
        public string? Name { get; set; }
        public string? Dni { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public ClientStatus? Status { get; set; }
        // Credentials for the auto-created user
        public string? Username { get; set; }
        public string? Password { get; set; }
    }
}
