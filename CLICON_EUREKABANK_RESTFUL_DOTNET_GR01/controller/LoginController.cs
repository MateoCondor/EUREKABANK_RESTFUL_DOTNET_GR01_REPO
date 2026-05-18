namespace Ec.Edu.Monster.Controller;

using System;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Client; // Tu cliente concreto AuthClient
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.View;
using Refit;

public class LoginController
{
    private readonly LoginView _view;
    private readonly AuthClient _client; // Clase concreta directa

    // Constructor explícito sin interfaces añadidas
    public LoginController(LoginView view, AuthClient client)
    {
        _view = view;
        _client = client;
    }

    // Retorna LoginResponse? (puede ser nulo si falla los 3 intentos) de forma asíncrona
    public async Task<LoginResponse?> RunAsync()
    {
        int maxAttempts = 3;
        int currentAttempt = 1;

        while (currentAttempt <= maxAttempts)
        {
            try
            {
                // 1. Invocamos la vista de login para obtener los datos de la consola
                LoginView.LoginData credentials = _view.ShowLogin();

                // 2. Construimos el DTO 'LoginRequest' que espera tu AuthClient
                var loginDto = new LoginRequest(credentials.Username, credentials.Password);

                // 3. Enviamos el DTO único a la llamada asíncrona
                LoginResponse? response = await _client.LoginAsync(loginDto);

                if (response != null)
                {
                    UserSession.Instance.SaveSession(response.Token, response.Username, response.Role);
                    _view.ShowWelcome(response.Username);
                    return response;
                }
            }
            catch (ApiException ex)
            {
                _view.ShowError(ex.Content ?? ex.Message ?? "Credenciales incorrectas o error de autenticación.");
            }
            catch (Exception ex)
            {
                _view.ShowError($"Error de red o conexión: {ex.Message ?? "Desconocido"}");
            }
            finally
            {
                ++currentAttempt;
            }
        }

        _view.ShowError("Has excedido los intentos de inicio de sesión. Inténtalo más tarde.");
        return null;
    }
}