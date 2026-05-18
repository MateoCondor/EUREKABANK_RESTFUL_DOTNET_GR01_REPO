namespace Ec.Edu.Monster.Model.Client;

using System;
using System.Net;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Service;
using Refit;

public class AuthClient
{
    private readonly IAuthService _service;

    public AuthClient(IAuthService service)
    {
        _service = service;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest dto)
    {
        try
        {
            return await _service.LoginAsync(dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.Unauthorized)
        {
            throw new Exception("Credenciales incorrectas. Verifique su usuario y contraseña.", ex);
        }
    }
}