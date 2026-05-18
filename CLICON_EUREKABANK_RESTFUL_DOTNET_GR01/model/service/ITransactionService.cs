namespace Ec.Edu.Monster.Model.Service;

using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Refit;

public interface ITransactionService
{
    [Get("/transactions/account/{accountId}")]
    Task<List<Transaction>> GetByAccountIdAsync(long accountId);

    [Post("/transactions/deposit")]
    Task<Transaction> DepositAsync([Body] DepositRequest dto);

    [Post("/transactions/withdraw")]
    Task<Transaction> WithdrawAsync([Body] WithdrawRequest dto);

    [Post("/transactions/transfer")]
    Task<Transaction> TransferAsync([Body] TransferRequest dto);
}