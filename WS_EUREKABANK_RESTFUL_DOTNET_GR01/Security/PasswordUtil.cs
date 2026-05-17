using System.Security.Cryptography;
using System.Text;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security
{
    public static class PasswordUtil
    {
        private const int SaltLength = 16;

        public static string HashPassword(string rawPassword)
        {
            if (rawPassword == null)
                throw new ArgumentNullException(nameof(rawPassword), "Password cannot be null");

            byte[] salt = new byte[SaltLength];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }

            byte[] hash = Sha256(rawPassword, salt);
            return Convert.ToBase64String(salt) + ":" + Convert.ToBase64String(hash);
        }

        public static bool VerifyPassword(string rawPassword, string storedHash)
        {
            if (rawPassword == null || storedHash == null)
                return false;

            string[] parts = storedHash.Split(':', 2);
            if (parts.Length != 2)
                return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] expectedHash = Convert.FromBase64String(parts[1]);
            byte[] actualHash = Sha256(rawPassword, salt);

            return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
        }

        private static byte[] Sha256(string rawPassword, byte[] salt)
        {
            using var digest = SHA256.Create();
            digest.TransformBlock(salt, 0, salt.Length, null, 0);
            byte[] passwordBytes = Encoding.UTF8.GetBytes(rawPassword);
            digest.TransformFinalBlock(passwordBytes, 0, passwordBytes.Length);
            return digest.Hash!;
        }
    }
}
