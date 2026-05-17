using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models
{
    [Table("transactions")]
    public class Transaction
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [MaxLength(10)]
        public TransactionType Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(15,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        [ForeignKey("SourceAccount")]
        public long SourceAccountId { get; set; }

        public Account SourceAccount { get; set; } = null!;

        [ForeignKey("TargetAccount")]
        public long? TargetAccountId { get; set; }

        public Account? TargetAccount { get; set; }

        [Column(TypeName = "decimal(15,2)")]
        public decimal? Fee { get; set; }

        [MaxLength(10)]
        public TransferType? TransferType { get; set; }

        [MaxLength(250)]
        public string? Description { get; set; }
    }
}
