namespace Ec.Edu.Monster.Controller;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Client; // Tu clase concreta TransactionClient
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.View;
using Refit;

public class TransactionController
{
    private readonly TransactionView _view;
    private readonly TransactionClient _client; // Inyección directa de clase concreta

    // Constructor explícito libre de Lombok
    public TransactionController(TransactionView view, TransactionClient client)
    {
        _view = view;
        _client = client;
    }

    // Punto de entrada del submódulo llamado por el MainMenuController
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
                        await GetByAccountAsync();
                        break;
                    case 2:
                        await DepositAsync();
                        break;
                    case 3:
                        await WithdrawAsync();
                        break;
                    case 4:
                        await TransferAsync();
                        break;
                    case 0:
                        inModule = false;
                        break;
                }
            }
            catch (ApiException ex)
            {
                _view.ShowError(ex.Content ?? ex.Message ?? "Error en la operación bancaria.");
            }
            catch (Exception ex)
            {
                _view.ShowError($"Error de sistema: {ex.Message ?? "Desconocido"}");
            }
        }
    }

    private async Task GetByAccountAsync()
    {
        long accountId = _view.AskAccountId();

        // Si la respuesta es null, inicializamos una lista vacía por seguridad
        List<Transaction> history = await _client.GetByAccountIdAsync(accountId) ?? new List<Transaction>();
        _view.ShowHistory(history);
    }

    private async Task DepositAsync()
    {
        DepositRequest request = _view.AskDepositData();
        Transaction? result = await _client.DepositAsync(request);

        if (result != null)
        {
            _view.ShowReceipt(result, "Depósito procesado de forma exitosa.");
        }
        else
        {
            _view.ShowError("No se pudo procesar el depósito en la cuenta destino.");
        }
    }

    private async Task WithdrawAsync()
    {
        WithdrawRequest request = _view.AskWithdrawData();
        Transaction? result = await _client.WithdrawAsync(request);

        if (result != null)
        {
            _view.ShowReceipt(result, "Retiro procesado de forma exitosa.");
        }
        else
        {
            _view.ShowError("No se pudo procesar el retiro por saldo insuficiente o cuenta inactiva.");
        }
    }

    private async Task TransferAsync()
    {
        TransferRequest request = _view.AskTransferData();
        Transaction? result = await _client.TransferAsync(request);

        if (result != null)
        {
            _view.ShowReceipt(result, "Transferencia procesada de forma exitosa.");
        }
        else
        {
            _view.ShowError("No se pudo procesar la transferencia bancaria.");
        }
    }
}