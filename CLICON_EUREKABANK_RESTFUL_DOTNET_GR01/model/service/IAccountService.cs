namespace Ec.Edu.Monster.Model.Service;

using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Refit;

public interface IAccountService
{
    [Get("/accounts")]
    Task<List<Account>> GetAllAsync();

    [Get("/accounts/{id}")]
    Task<Account> GetByIdAsync(long id);

    [Get("/accounts/{id}/balance")]
    Task<AccountBalanceResponse> GetBalanceAsync(long id);

    [Get("/accounts/client/{clientId}")]
    Task<List<Account>> GetByClientIdAsync(long clientId);

    [Post("/accounts")]
    Task<Account> CreateAsync([Body] AccountRequest dto);

    [Put("/accounts/{id}/status")]
    Task<Account> UpdateStatusAsync(long id, [Body] AccountStatusRequest dto);
}