namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class WithdrawDTO
    {
        public long? AccountId { get; set; }
        public decimal? Amount { get; set; }
        public string? Description { get; set; }
    }
}
