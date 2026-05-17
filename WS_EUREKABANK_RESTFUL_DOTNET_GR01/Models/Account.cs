using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models
{
    [Table("accounts")]
    public class Account
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string AccountNumber { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(15,2)")]
        public decimal Balance { get; set; } = 0m;

        [Required]
        [MaxLength(10)]
        public AccountStatus Status { get; set; }

        [Required]
        [MaxLength(10)]
        public AccountType Type { get; set; }

        [Required]
        [ForeignKey("Client")]
        public long ClientId { get; set; }

        public Client Client { get; set; } = null!;
    }
}
