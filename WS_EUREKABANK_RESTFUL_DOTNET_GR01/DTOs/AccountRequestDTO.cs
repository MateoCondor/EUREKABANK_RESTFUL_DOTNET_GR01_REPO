using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class AccountRequestDTO
    {
        public long? ClientId { get; set; }
        public AccountType? Type { get; set; }
        public AccountStatus? Status { get; set; }
    }
}
