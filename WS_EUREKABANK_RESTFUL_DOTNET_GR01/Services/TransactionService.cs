using Microsoft.EntityFrameworkCore;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public class TransactionService
    {
        private const string ParamTransferFee = "transfer.fee.percentage";
        private const string ParamTransferDailyLimit = "transfer.daily.limit";
        private const string ParamWithdrawDailyLimit = "withdraw.daily.limit";
        private const string ParamMinBalance = "account.min.balance";
        private const string ParamCreditFee = "transfer.credit.fee.percentage";
        private const string ParamDebitFee = "transfer.debit.fee.percentage";
        private const string ParamCreditDailyLimit = "transfer.credit.daily.limit";
        private const string ParamDebitDailyLimit = "transfer.debit.daily.limit";

        private readonly ApplicationDbContext _context;
        private readonly AccountService _accountService;
        private readonly ParameterService _parameterService;

        public TransactionService(ApplicationDbContext context, AccountService accountService, ParameterService parameterService)
        {
            _context = context;
            _accountService = accountService;
            _parameterService = parameterService;
        }

        public async Task<TransactionResponseDTO> Deposit(DepositDTO? request)
        {
            if (request == null) throw new TransactionException("Request body is required", 400);
            if (request.AccountId == null) throw new TransactionException("Account id is required", 400);
            ValidateAmount(request.Amount);

            var account = await _accountService.RequireActiveAccount(request.AccountId.Value);
            account.Balance += request.Amount!.Value;

            var tx = BuildTransaction(Models.TransactionType.DEPOSIT, null, request.Amount.Value, 0m, account, null, request.Description);
            _context.Transactions.Add(tx);
            await _context.SaveChangesAsync();
            return ToResponse(tx);
        }

        public async Task<TransactionResponseDTO> Withdraw(WithdrawDTO? request)
        {
            if (request == null) throw new TransactionException("Request body is required", 400);
            if (request.AccountId == null) throw new TransactionException("Account id is required", 400);
            ValidateAmount(request.Amount);

            var account = await _accountService.RequireActiveAccount(request.AccountId.Value);
            decimal amount = request.Amount!.Value;

            // 1. Check daily withdraw limit
            decimal withdrawDailyLimit = ParseParam(await _parameterService.GetValueOrDefault(ParamWithdrawDailyLimit, "0"), ParamWithdrawDailyLimit);
            if (withdrawDailyLimit > 0)
            {
                decimal todayWithdrawn = await GetDailyAmount(request.AccountId.Value, Models.TransactionType.WITHDRAW);
                if (todayWithdrawn + amount > withdrawDailyLimit)
                    throw new TransactionException($"Daily withdraw limit exceeded. Limit: {withdrawDailyLimit}, already withdrawn today: {todayWithdrawn}", 400);
            }

            // 2. Check minimum balance
            decimal minBalance = ParseParam(await _parameterService.GetValueOrDefault(ParamMinBalance, "0"), ParamMinBalance);
            decimal balanceAfter = account.Balance - amount;
            if (balanceAfter < 0) throw new TransactionException("Insufficient balance", 400);
            if (balanceAfter < minBalance) throw new TransactionException($"Withdrawal would leave balance below the required minimum of {minBalance}", 400);

            account.Balance = balanceAfter;
            var tx = BuildTransaction(Models.TransactionType.WITHDRAW, null, amount, 0m, account, null, request.Description);
            _context.Transactions.Add(tx);
            await _context.SaveChangesAsync();
            return ToResponse(tx);
        }

        public async Task<TransactionResponseDTO> Transfer(TransferDTO? request)
        {
            if (request == null) throw new TransactionException("Request body is required", 400);
            if (request.SourceAccountId == null || request.TargetAccountId == null)
                throw new TransactionException("Source and target account are required", 400);
            if (request.SourceAccountId == request.TargetAccountId)
                throw new TransactionException("Source and target accounts must be different", 400);
            if (request.TransferType == null)
                throw new TransactionException("Transfer type is required (CREDIT or DEBIT)", 400);
            ValidateAmount(request.Amount);

            var transferType = request.TransferType.Value;
            var source = await _accountService.RequireActiveAccount(request.SourceAccountId.Value);
            var target = await _accountService.RequireActiveAccount(request.TargetAccountId.Value);
            decimal amount = request.Amount!.Value;

            // 1. Resolve fee
            string feeKey = transferType == Models.TransferType.CREDIT ? ParamCreditFee : ParamDebitFee;
            string genericFeeDefault = await _parameterService.GetValueOrDefault(ParamTransferFee, "0");
            decimal feePercentage = ParseParam(await _parameterService.GetValueOrDefault(feeKey, genericFeeDefault), feeKey);
            decimal fee = Math.Round(amount * feePercentage / 100m, 2, MidpointRounding.AwayFromZero);
            decimal totalDeducted = amount + fee;

            // 2. Resolve daily limit
            string limitKey = transferType == Models.TransferType.CREDIT ? ParamCreditDailyLimit : ParamDebitDailyLimit;
            string genericLimitDefault = await _parameterService.GetValueOrDefault(ParamTransferDailyLimit, "0");
            decimal dailyLimit = ParseParam(await _parameterService.GetValueOrDefault(limitKey, genericLimitDefault), limitKey);
            if (dailyLimit > 0)
            {
                decimal todayTransferred = await GetDailyAmount(request.SourceAccountId.Value, Models.TransactionType.TRANSFER);
                if (todayTransferred + amount > dailyLimit)
                    throw new TransactionException($"Daily {transferType.ToString().ToLower()} transfer limit exceeded. Limit: {dailyLimit}, already transferred today: {todayTransferred}", 400);
            }

            // 3. Verify balance
            if (source.Balance < totalDeducted)
            {
                string msg = fee > 0 ? $"Insufficient balance. Transfer requires {totalDeducted} (amount: {amount} + fee: {fee})" : "Insufficient balance";
                throw new TransactionException(msg, 400);
            }

            // 4. Apply
            source.Balance -= totalDeducted;
            target.Balance += amount;

            var tx = BuildTransaction(Models.TransactionType.TRANSFER, transferType, amount, fee, source, target, request.Description);
            _context.Transactions.Add(tx);
            await _context.SaveChangesAsync();
            return ToResponse(tx);
        }

        public async Task<List<TransactionResponseDTO>> GetTransactionsByAccount(long accountId)
        {
            await _accountService.RequireAccount(accountId);
            var transactions = await _context.Transactions
                .Where(t => t.SourceAccountId == accountId || t.TargetAccountId == accountId)
                .OrderByDescending(t => t.Date).ToListAsync();
            return transactions.Select(ToResponse).ToList();
        }

        private Transaction BuildTransaction(Models.TransactionType type, Models.TransferType? transferType, decimal amount, decimal fee, Account source, Account? target, string? description)
        {
            return new Transaction
            {
                Type = type, TransferType = transferType, Amount = amount, Fee = fee,
                Date = DateTime.UtcNow, SourceAccountId = source.Id, TargetAccountId = target?.Id,
                Description = description?.Trim()
            };
        }

        private static TransactionResponseDTO ToResponse(Transaction t) => new()
        {
            Id = t.Id, Type = t.Type, TransferType = t.TransferType, Amount = t.Amount,
            Fee = t.Fee, Date = t.Date, SourceAccountId = t.SourceAccountId,
            TargetAccountId = t.TargetAccountId, Description = t.Description
        };

        private static void ValidateAmount(decimal? amount)
        {
            if (amount == null || amount <= 0) throw new TransactionException("Amount must be greater than zero", 400);
        }

        private async Task<decimal> GetDailyAmount(long accountId, Models.TransactionType type)
        {
            var startOfDay = DateTime.UtcNow.Date;
            var endOfDay = startOfDay.AddDays(1);
            return await _context.Transactions
                .Where(t => t.SourceAccountId == accountId && t.Type == type && t.Date >= startOfDay && t.Date < endOfDay)
                .SumAsync(t => t.Amount);
        }

        private static decimal ParseParam(string value, string key)
        {
            if (decimal.TryParse(value, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out decimal result))
                return result;
            throw new TransactionException($"Invalid system parameter value for: {key}", 500);
        }
    }
}
