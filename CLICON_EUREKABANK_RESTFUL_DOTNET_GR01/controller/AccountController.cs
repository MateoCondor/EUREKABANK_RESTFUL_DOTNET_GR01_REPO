namespace Ec.Edu.Monster.Controller;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Client;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.View;
using Refit;

public class AccountController
{
    private readonly AccountView _view;
    private readonly AccountClient _client;

    public AccountController(AccountView view, AccountClient client)
    {
        _view = view;
        _client = client;
    }

    public async Task RunAsync()
    {
        bool inModule = true;
        while (inModule)
        {
            int option = _view.ShowSubMenu();
            try
            {
                switch (option)
                {
                    case 1:
                        await GetAllAsync();
                        break;
                    case 2:
                        await GetByIdAsync();
                        break;
                    case 3:
                        await GetBalanceAsync();
                        break;
                    case 4:
                        await GetByClientAsync();
                        break;
                    case 5:
                        await CreateAsync();
                        break;
                    case 6:
                        await UpdateStatusAsync();
                        break;
                    case 0:
                        inModule = false;
                        break;
                }
            }
            catch (ApiException ex)
            {
                // Agregamos un fallback final ("Error en la API") para asegurar que jamás se pase un nulo a ShowError
                _view.ShowError(ex.Content ?? ex.Message ?? "Error en la llamada a la API");
            }
            catch (Exception ex)
            {
                _view.ShowError($"Error inesperado: {ex.Message ?? "Desconocido"}");
            }
        }
    }

    private async Task GetAllAsync()
    {
        // Si la API llega a retornar null, inicializamos una lista vacía para proteger a la Vista
        List<Account> list = await _client.GetAllAsync() ?? new List<Account>();
        _view.ShowAccounts(list);
    }

    private async Task GetByIdAsync()
    {
        long id = _view.AskAccountId("consultar detalles");
        Account? a = await _client.GetByIdAsync(id);

        if (a != null)
        {
            _view.ShowAccountDetails(a);
        }
        else
        {
            _view.ShowError("No se encontró la cuenta solicitada.");
        }
    }

    private async Task GetBalanceAsync()
    {
        long id = _view.AskAccountId("verificar el saldo");
        var balanceResponse = await _client.GetBalanceAsync(id);

        if (balanceResponse != null)
        {
            _view.ShowBalance(balanceResponse.Balance);
        }
        else
        {
            _view.ShowError("No se pudo obtener el saldo de la cuenta.");
        }
    }

    private async Task GetByClientAsync()
    {
        long clientId = _view.AskClientId();
        List<Account> list = await _client.GetByClientIdAsync(clientId) ?? new List<Account>();
        _view.ShowAccounts(list);
    }

    private async Task CreateAsync()
    {
        AccountRequest request = _view.AskAccountData();
        Account? newAccount = await _client.CreateAsync(request);

        if (newAccount != null)
        {
            _view.ShowSuccess($"Cuenta bancaria abierta con éxito. Nro: {newAccount.AccountNumber}");
        }
        else
        {
            _view.ShowError("No se pudo procesar la apertura de la cuenta.");
        }
    }

    private async Task UpdateStatusAsync()
    {
        long id = _view.AskAccountId("modificar el estado");

        Account? actual = await _client.GetByIdAsync(id);
        if (actual == null)
        {
            _view.ShowError("La cuenta especificada no existe.");
            return;
        }

        AccountStatusRequest request = _view.AskStatusUpdate(actual.Status);
        Account? updated = await _client.UpdateStatusAsync(id, request);

        if (updated != null)
        {
            _view.ShowSuccess($"Estado de la cuenta {updated.AccountNumber} actualizado a: {updated.Status}");
        }
        else
        {
            _view.ShowError("No se pudo actualizar el estado de la cuenta.");
        }
    }
}