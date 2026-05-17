using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class ClientResponseDTO
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Dni { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public ClientStatus Status { get; set; }
        public long UserId { get; set; }
        public string Username { get; set; } = string.Empty;
    }
}
