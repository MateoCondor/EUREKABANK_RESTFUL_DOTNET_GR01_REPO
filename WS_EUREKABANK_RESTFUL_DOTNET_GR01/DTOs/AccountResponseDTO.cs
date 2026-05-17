using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class AccountResponseDTO
    {
        public long Id { get; set; }
        public string AccountNumber { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public AccountStatus Status { get; set; }
        public AccountType Type { get; set; }
        public long ClientId { get; set; }
    }
}
