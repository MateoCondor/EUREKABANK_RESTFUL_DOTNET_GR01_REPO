using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public static class AuthDataSeeder
    {
        private const string DefaultUsername = "MONSTER";
        private const string DefaultPassword = "MONSTER9";

        public static void SeedDefaultUser(ApplicationDbContext context)
        {
            if (context.Users.Any(u => u.Username == DefaultUsername))
                return;

            var user = new User
            {
                Username = DefaultUsername,
                Password = PasswordUtil.HashPassword(DefaultPassword),
                Role = UserRole.ADMIN,
                Status = UserStatus.ACTIVE
            };

            context.Users.Add(user);
            context.SaveChanges();
        }
    }
}
