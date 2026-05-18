namespace Ec.Edu.Monster.Controller;

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Client;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.View;
using Refit; // Se mantiene por si el servicio propaga las ApiException de las peticiones HTTP

public class ClientController
{
    private readonly ClientView _view;
    private readonly ClientClient _client; // Clase concreta en lugar de interfaz

    // Constructor que sustituye el @RequiredArgsConstructor de Lombok
    public ClientController(ClientView view, ClientClient client)
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
                        await GetByDniAsync();
                        break;
                    case 4:
                        await CreateAsync();
                        break;
                    case 5:
                        await UpdateAsync();
                        break;
                    case 6:
                        await DeleteAsync();
                        break;
                    case 0:
                        inModule = false;
                        break;
                }
            }
            catch (ApiException ex)
            {
                _view.ShowError(ex.Content ?? ex.Message ?? "Error en la API de Clientes");
            }
            catch (Exception ex)
            {
                _view.ShowError($"Error inesperado: {ex.Message ?? "Desconocido"}");
            }
        }
    }

    private async Task GetAllAsync()
    {
        List<Client> list = await _client.GetAllAsync() ?? new List<Client>();
        _view.ShowClients(list);
    }

    private async Task GetByIdAsync()
    {
        long? id = _view.AskId("buscar");
        if (id == null)
            return;

        Client? c = await _client.GetByIdAsync(id.Value);
        if (c != null)
        {
            _view.ShowClientDetails(c);
        }
        else
        {
            _view.ShowError("No se encontró el cliente con el ID especificado.");
        }
    }

    private async Task GetByDniAsync()
    {
        string dni = _view.AskDni();
        if (string.IsNullOrWhiteSpace(dni))
            return;

        Client? c = await _client.GetByDniAsync(dni);
        if (c != null)
        {
            _view.ShowClientDetails(c);
        }
        else
        {
            _view.ShowError("No se encontró el cliente con el DNI especificado.");
        }
    }

    private async Task CreateAsync()
    {
        // Pasamos null explícitamente para indicar que es un registro nuevo, igual que en Java
        ClientRequest request = _view.AskClientData(null);
        Client? newClient = await _client.CreateAsync(request);

        if (newClient != null)
        {
            _view.ShowSuccess($"Cliente registrado con ID: {newClient.Id}");
        }
        else
        {
            _view.ShowError("No se pudo registrar al cliente.");
        }
    }

    private async Task UpdateAsync()
    {
        long? id = _view.AskId("actualizar");
        if (id == null)
            return;

        Client? currentClient = await _client.GetByIdAsync(id.Value);
        if (currentClient == null)
        {
            _view.ShowError("El cliente que intenta actualizar no existe.");
            return;
        }

        ClientRequest request = _view.AskClientData(currentClient);
        await _client.UpdateAsync(id.Value, request);
        _view.ShowSuccess("Cliente actualizado correctamente.");
    }

    private async Task DeleteAsync()
    {
        long? id = _view.AskId("eliminar");
        if (id == null)
            return;

        // Opcional: Podrías buscar si existe antes de eliminar, pero delegamos el flujo al servicio
        await _client.DeleteAsync(id.Value);
        _view.ShowSuccess("Cliente eliminado correctamente.");
    }
}