using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security
{
    public static class JwtUtil
    {
        private const string HmacAlgorithm = "HmacSHA256";
        private const long TokenTtlSeconds = 3600;
        private static readonly string Secret = Environment.GetEnvironmentVariable("JWT_SECRET") ?? "change-me";

        public static string GenerateToken(string username, string role)
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(role))
                throw new ArgumentException("Username and role are required");

            long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            long exp = now + TokenTtlSeconds;

            var header = new { alg = "HS256", typ = "JWT" };
            var payload = new { sub = username, role, iat = now, exp };

            string headerEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(header)));
            string payloadEncoded = Base64UrlEncode(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(payload)));
            string signingInput = headerEncoded + "." + payloadEncoded;
            string signature = Base64UrlEncode(HmacSha256(signingInput));

            return signingInput + "." + signature;
        }

        public static JwtPayload ValidateToken(string token)
        {
            try
            {
                string? normalized = NormalizeToken(token);
                if (string.IsNullOrWhiteSpace(normalized))
                    throw new AuthException("Invalid token", 400);

                string[] parts = normalized.Split('.');
                if (parts.Length != 3)
                    throw new AuthException("Invalid token", 400);

                string signingInput = parts[0] + "." + parts[1];
                byte[] expectedSignature = HmacSha256(signingInput);
                byte[] actualSignature = Base64UrlDecodeToBytes(parts[2]);

                if (!CryptographicOperations.FixedTimeEquals(expectedSignature, actualSignature))
                    throw new AuthException("Invalid token", 400);

                string payloadJson = Encoding.UTF8.GetString(Base64UrlDecodeToBytes(parts[1]));
                using var doc = JsonDocument.Parse(payloadJson);
                var root = doc.RootElement;

                if (!root.TryGetProperty("exp", out var expElement))
                    throw new AuthException("Invalid token", 400);

                long exp = expElement.GetInt64();
                long now = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
                if (now >= exp)
                    throw new AuthException("Token expired", 400);

                string? username = root.TryGetProperty("sub", out var subElement) ? subElement.GetString() : null;
                string? role = root.TryGetProperty("role", out var roleElement) ? roleElement.GetString() : null;

                if (username == null || role == null)
                    throw new AuthException("Invalid token", 400);

                return new JwtPayload(username, role, exp);
            }
            catch (AuthException)
            {
                throw;
            }
            catch
            {
                throw new AuthException("Invalid token", 400);
            }
        }

        private static byte[] HmacSha256(string signingInput)
        {
            byte[] keyBytes = Encoding.UTF8.GetBytes(Secret);
            byte[] inputBytes = Encoding.UTF8.GetBytes(signingInput);
            using var hmac = new HMACSHA256(keyBytes);
            return hmac.ComputeHash(inputBytes);
        }

        private static string Base64UrlEncode(byte[] value)
        {
            return Convert.ToBase64String(value)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }

        private static byte[] Base64UrlDecodeToBytes(string value)
        {
            string base64 = value.Replace('-', '+').Replace('_', '/');
            switch (base64.Length % 4)
            {
                case 2: base64 += "=="; break;
                case 3: base64 += "="; break;
            }
            return Convert.FromBase64String(base64);
        }

        private static string? NormalizeToken(string? token)
        {
            if (token == null) return null;
            string trimmed = token.Trim();
            if (trimmed.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return trimmed[7..].Trim();
            return trimmed;
        }
    }
}
