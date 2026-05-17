using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class TransferDTO
    {
        public long? SourceAccountId { get; set; }
        public long? TargetAccountId { get; set; }
        public decimal? Amount { get; set; }
        public string? Description { get; set; }
        /// <summary>
        /// Required. CREDIT = source pushes money to target (wire transfer).
        ///           DEBIT  = target pulls money from source (direct debit).
        /// </summary>
        public TransferType? TransferType { get; set; }
    }
}
