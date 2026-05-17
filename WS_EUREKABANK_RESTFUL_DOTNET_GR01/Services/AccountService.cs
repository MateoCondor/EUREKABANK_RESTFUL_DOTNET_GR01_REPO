using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public class AccountService
    {
        private const int AccountNumberLength = 12;
        private readonly ApplicationDbContext _context;

        public AccountService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<AccountResponseDTO> CreateAccount(AccountRequestDTO? request)
        {
            if (request == null)
                throw new AccountException("Request body is required", 400);
            if (request.ClientId == null)
                throw new AccountException("Client id is required", 400);
            if (request.Type == null)
                throw new AccountException("Account type is required", 400);

            var client = await _context.Clients.FindAsync(request.ClientId.Value);
            if (client == null)
                throw new AccountException("Client not found", 404);

            var account = new Account
            {
                ClientId = client.Id,
                Type = request.Type.Value,
                Status = AccountStatus.ACTIVE,
                Balance = 0m,
                AccountNumber = await GenerateUniqueAccountNumber()
            };

            _context.Accounts.Add(account);
            await _context.SaveChangesAsync();
            return ToResponse(account);
        }

        public async Task<AccountResponseDTO> GetAccountById(long id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
                throw new AccountException("Account not found", 404);
            return ToResponse(account);
        }

        public async Task<List<AccountResponseDTO>> GetAllAccounts()
        {
            var accounts = await _context.Accounts.OrderBy(a => a.Id).ToListAsync();
            return accounts.Select(ToResponse).ToList();
        }

        public async Task<List<AccountResponseDTO>> GetAccountsByClient(long clientId)
        {
            var client = await _context.Clients.FindAsync(clientId);
            if (client == null)
                throw new AccountException("Client not found", 404);

            var accounts = await _context.Accounts
                .Where(a => a.ClientId == clientId)
                .OrderBy(a => a.Id)
                .ToListAsync();
            return accounts.Select(ToResponse).ToList();
        }

        public async Task<AccountResponseDTO> UpdateStatus(long id, AccountStatus? status)
        {
            if (status == null)
                throw new AccountException("Account status is required", 400);

            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
                throw new AccountException("Account not found", 404);

            account.Status = status.Value;
            await _context.SaveChangesAsync();
            return ToResponse(account);
        }

        public async Task<decimal> GetBalance(long id)
        {
            var account = await _context.Accounts.FindAsync(id);
            if (account == null)
                throw new AccountException("Account not found", 404);
            if (account.Status != AccountStatus.ACTIVE)
                throw new AccountException("Account is not active", 400);
            return account.Balance;
        }

        /// <summary>
        /// Returns the Account entity if it exists and is ACTIVE.
        /// Used internally by TransactionService to operate within the same EF transaction.
        /// </summary>
        public async Task<Account> RequireActiveAccount(long accountId)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null)
                throw new AccountException("Account not found", 404);
            if (account.Status != AccountStatus.ACTIVE)
                throw new AccountException("Account is not active", 400);
            return account;
        }

        /// <summary>
        /// Returns the Account entity if it exists (any status).
        /// Used internally by TransactionService to verify account existence.
        /// </summary>
        public async Task<Account> RequireAccount(long accountId)
        {
            var account = await _context.Accounts.FindAsync(accountId);
            if (account == null)
                throw new AccountException("Account not found", 404);
            return account;
        }

        private AccountResponseDTO ToResponse(Account account)
        {
            return new AccountResponseDTO
            {
                Id = account.Id,
                AccountNumber = account.AccountNumber,
                Balance = account.Balance,
                Status = account.Status,
                Type = account.Type,
                ClientId = account.ClientId
            };
        }

        private async Task<string> GenerateUniqueAccountNumber()
        {
            for (int attempt = 0; attempt < 10; attempt++)
            {
                string candidate = GenerateAccountNumber();
                bool exists = await _context.Accounts.AnyAsync(a => a.AccountNumber == candidate);
                if (!exists)
                    return candidate;
            }
            throw new AccountException("Unable to generate account number", 400);
        }

        private static string GenerateAccountNumber()
        {
            var random = RandomNumberGenerator.Create();
            var builder = new char[AccountNumberLength];
            var buffer = new byte[AccountNumberLength];
            random.GetBytes(buffer);
            for (int i = 0; i < AccountNumberLength; i++)
            {
                builder[i] = (char)('0' + (buffer[i] % 10));
            }
            return new string(builder);
        }
    }
}
