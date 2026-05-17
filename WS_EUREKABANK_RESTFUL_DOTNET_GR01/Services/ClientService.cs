using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Security;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public class ClientService
    {
        private static readonly Regex EmailPattern = new(
            @"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$",
            RegexOptions.Compiled);

        private readonly ApplicationDbContext _context;

        public ClientService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Creates a client and its associated user account atomically.
        /// Every client must have a user; username and password are required.
        /// </summary>
        public async Task<ClientResponseDTO> CreateClient(ClientRequestDTO? request)
        {
            if (request == null)
                throw new ClientException("Request body is required", 400);

            string? name = request.Name?.Trim();
            string? dni = request.Dni?.Trim();
            string? email = request.Email?.Trim();
            string? phone = request.Phone?.Trim();
            string? username = request.Username?.Trim();
            string? password = request.Password;
            ClientStatus status = request.Status ?? ClientStatus.ACTIVE;

            // Validate client fields
            ValidateRequired("Name", name);
            ValidateRequired("DNI", dni);
            ValidateRequired("Email", email);
            ValidateEmail(email!);

            // Validate user credentials
            ValidateRequired("Username", username);
            ValidateRequired("Password", password);
            if (password!.Length < 6)
                throw new ClientException("Password must be at least 6 characters", 400);

            // Check uniqueness
            if (await _context.Clients.AnyAsync(c => c.Dni == dni))
                throw new ClientException("DNI already exists", 409);
            if (await _context.Users.AnyAsync(u => u.Username == username))
                throw new ClientException("Username already exists", 409);

            // 1. Create User first (Client holds the FK)
            var user = new User
            {
                Username = username!,
                Password = PasswordUtil.HashPassword(password),
                Role = UserRole.USER,
                Status = UserStatus.ACTIVE
            };
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // 2. Create Client linked to the new User
            var client = new Client
            {
                Name = name!,
                Dni = dni!,
                Email = email!,
                Phone = phone,
                Status = status,
                UserId = user.Id
            };
            _context.Clients.Add(client);
            await _context.SaveChangesAsync();

            return ToResponse(client, user);
        }

        public async Task<ClientResponseDTO> UpdateClient(long id, ClientRequestDTO? request)
        {
            if (request == null)
                throw new ClientException("Request body is required", 400);

            var client = await _context.Clients.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
            if (client == null)
                throw new ClientException("Client not found", 404);

            string? name = request.Name?.Trim();
            string? dni = request.Dni?.Trim();
            string? email = request.Email?.Trim();
            string? phone = request.Phone?.Trim();
            ClientStatus status = request.Status ?? client.Status;

            ValidateRequired("Name", name);
            ValidateRequired("DNI", dni);
            ValidateRequired("Email", email);
            ValidateEmail(email!);

            if (client.Dni != dni)
            {
                if (await _context.Clients.AnyAsync(c => c.Dni == dni))
                    throw new ClientException("DNI already exists", 409);
            }

            client.Name = name!;
            client.Dni = dni!;
            client.Email = email!;
            client.Phone = phone;
            client.Status = status;

            await _context.SaveChangesAsync();
            return ToResponse(client, client.User);
        }

        public async Task<ClientResponseDTO> GetClientById(long id)
        {
            var client = await _context.Clients.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
            if (client == null)
                throw new ClientException("Client not found", 404);
            return ToResponse(client, client.User);
        }

        public async Task<List<ClientResponseDTO>> GetAllClients()
        {
            var clients = await _context.Clients
                .Include(c => c.User)
                .OrderBy(c => c.Id)
                .ToListAsync();
            return clients.Select(c => ToResponse(c, c.User)).ToList();
        }

        public async Task<ClientResponseDTO> FindByDni(string? dni)
        {
            string? normalized = dni?.Trim();
            ValidateRequired("DNI", normalized);

            var client = await _context.Clients
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.Dni == normalized);
            if (client == null)
                throw new ClientException("Client not found", 404);
            return ToResponse(client, client.User);
        }

        public async Task DeleteClient(long id)
        {
            var client = await _context.Clients.FindAsync(id);
            if (client == null)
                throw new ClientException("Client not found", 404);
            _context.Clients.Remove(client);
            await _context.SaveChangesAsync();
        }

        // ── Private helpers ───────────────────────────────────────────────────────

        private static void ValidateRequired(string field, string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ClientException($"{field} is required", 400);
        }

        private static void ValidateEmail(string email)
        {
            if (!EmailPattern.IsMatch(email))
                throw new ClientException("Email is invalid", 400);
        }

        private static ClientResponseDTO ToResponse(Client client, User user)
        {
            return new ClientResponseDTO
            {
                Id = client.Id,
                Name = client.Name,
                Dni = client.Dni,
                Email = client.Email,
                Phone = client.Phone,
                Status = client.Status,
                UserId = user.Id,
                Username = user.Username
            };
        }
    }
}
