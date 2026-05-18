namespace Ec.Edu.Monster.Model.Client;

using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Service;
using Refit;

public class ClientClient
{
    private readonly IClientService _service;

    public ClientClient(IClientService service)
    {
        _service = service;
    }

    public async Task<List<Client>> GetAllAsync()
    {
        try
        {
            return await _service.GetAllAsync();
        }
        catch (ApiException)
        {
            return new List<Client>();
        }
    }

    public async Task<Client?> GetByIdAsync(long id)
    {
        try
        {
            return await _service.GetByIdAsync(id);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("El cliente no existe", ex);
        }
    }

    public async Task<Client?> GetByDniAsync(string dni)
    {
        try
        {
            return await _service.GetByDniAsync(dni);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("No se pudo encontrar el cliente por el DNI", ex);
        }
    }

    public async Task<Client?> CreateAsync(ClientRequest request)
    {
        try
        {
            return await _service.CreateAsync(request);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
        {
            throw new Exception("El DNI o nombre de usuario ya existe", ex);
        }
    }

    public async Task<Client?> UpdateAsync(long id, ClientRequest request)
    {
        try
        {
            return await _service.UpdateAsync(id, request);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("El cliente no existe", ex);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
        {
            throw new Exception("El DNI ya esta siendo utilizado", ex);
        }
    }

    public async Task DeleteAsync(long id)
    {
        try
        {
            await _service.DeleteAsync(id);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("El cliente no existe", ex);
        }
    }
}