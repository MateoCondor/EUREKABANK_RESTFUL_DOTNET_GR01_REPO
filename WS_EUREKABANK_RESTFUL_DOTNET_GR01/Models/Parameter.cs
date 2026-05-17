using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models
{
    [Table("parameters")]
    public class Parameter
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("param_key")]
        public string Key { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        [Column("param_value")]
        public string Value { get; set; } = string.Empty;

        [MaxLength(250)]
        public string? Description { get; set; }
    }
}
