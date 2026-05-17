using Microsoft.EntityFrameworkCore;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;

        public AuthService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LoginResponseDTO> Login(LoginRequestDTO? request)
        {
            if (request == null)
                throw new AuthException("Request body is required", 400);

            string? username = request.Username?.Trim();
            string? password = request.Password;

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                throw new AuthException("Username and password are required", 400);

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
                throw new AuthException("User not found", 404);

            if (user.Status != UserStatus.ACTIVE)
                throw new AuthException("User is inactive", 400);

            if (!PasswordUtil.VerifyPassword(password, user.Password))
                throw new AuthException("Invalid credentials", 400);

            string token = JwtUtil.GenerateToken(user.Username, user.Role.ToString());
            return new LoginResponseDTO
            {
                Token = token,
                Username = user.Username,
                Role = user.Role.ToString()
            };
        }

        public JwtPayload ValidateToken(string token)
        {
            return JwtUtil.ValidateToken(token);
        }
    }
}
