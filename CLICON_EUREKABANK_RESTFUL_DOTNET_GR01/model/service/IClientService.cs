namespace Ec.Edu.Monster.Model.Service;

using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Refit;

public interface IClientService
{
    [Get("/clients")]
    Task<List<Client>> GetAllAsync();

    [Get("/clients/{id}")]
    Task<Client> GetByIdAsync(long id);

    [Get("/clients/dni/{dni}")]
    Task<Client> GetByDniAsync(string dni);

    [Post("/clients")]
    Task<Client> CreateAsync([Body] ClientRequest request);

    [Put("/clients/{id}")]
    Task<Client> UpdateAsync(long id, [Body] ClientRequest request);

    [Delete("/clients/{id}")]
    Task DeleteAsync(long id);
}