using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class TransactionResponseDTO
    {
        public long Id { get; set; }
        public TransactionType Type { get; set; }
        public TransferType? TransferType { get; set; }
        public decimal Amount { get; set; }
        public decimal? Fee { get; set; }
        public DateTime Date { get; set; }
        public long SourceAccountId { get; set; }
        public long? TargetAccountId { get; set; }
        public string? Description { get; set; }
    }
}
