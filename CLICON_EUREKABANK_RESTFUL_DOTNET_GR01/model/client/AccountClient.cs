namespace Ec.Edu.Monster.Model.Client;

using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Service;
using Refit;

public class AccountClient
{
    private readonly IAccountService _service;

    // Constructor (Reemplaza a @RequiredArgsConstructor)
    public AccountClient(IAccountService service)
    {
        _service = service;
    }

    public async Task<List<Account>> GetAllAsync()
    {
        try
        {
            return await _service.GetAllAsync();
        }
        catch (ApiException)
        {
            return new List<Account>(); // Retorna lista vacía si falla de forma genérica
        }
    }

    public async Task<Account?> GetByIdAsync(long id)
    {
        try
        {
            return await _service.GetByIdAsync(id);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("La cuenta no existe", ex);
        }
    }

    public async Task<AccountBalanceResponse?> GetBalanceAsync(long id)
    {
        try
        {
            return await _service.GetBalanceAsync(id);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("La cuenta no existe", ex);
        }
    }

    public async Task<List<Account>> GetByClientIdAsync(long clientId)
    {
        try
        {
            return await _service.GetByClientIdAsync(clientId);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("El cliente no existe", ex);
        }
    }

    public async Task<Account?> CreateAsync(AccountRequest dto)
    {
        try
        {
            return await _service.CreateAsync(dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("El cliente no existe", ex);
        }
    }

    public async Task<Account?> UpdateStatusAsync(long id, AccountStatusRequest dto)
    {
        try
        {
            return await _service.UpdateStatusAsync(id, dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("La cuenta no existe", ex);
        }
    }
}