using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models
{
    [Table("users")]
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public long Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Username { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [MaxLength(10)]
        public UserRole Role { get; set; }

        [Required]
        [MaxLength(10)]
        public UserStatus Status { get; set; }

        // Inverse side: a user may or may not have an associated client (admin users have none)
        public Client? Client { get; set; }
    }
}
