namespace Ec.Edu.Monster.View;

using System;
using System.Collections.Generic;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Enums;
using Ec.Edu.Monster.Utils; // Para usar el .GetLabel() de tus enums

public class ClientView
{
    public int ShowSubMenu()
    {
        Console.WriteLine("\n--- GESTIÓN DE CLIENTES ---");
        Console.WriteLine("1. Listar todos los clientes");
        Console.WriteLine("2. Buscar cliente por ID");
        Console.WriteLine("3. Buscar cliente por DNI");
        Console.WriteLine("4. Registrar nuevo cliente");
        Console.WriteLine("5. Actualizar cliente");
        Console.WriteLine("6. Eliminar cliente");
        Console.WriteLine("0. Volver al Menú Principal");
        return ReadOption(0, 6);
    }

    public ClientStatus? AskClientStatus()
    {
        Console.WriteLine("--- Estado ---");
        Console.WriteLine("1. Activo");
        Console.WriteLine("2. Inactivo");

        while (true)
        {
            Console.Write("Seleccione una opción (o Enter para omitir): ");
            string? optionInput = Console.ReadLine();

            if (string.IsNullOrWhiteSpace(optionInput))
                return null;

            if (int.TryParse(optionInput, out int option))
            {
                switch (option)
                {
                    case 1:
                        return ClientStatus.Active;
                    case 2:
                        return ClientStatus.Inactive; // Corregido el bug de Java
                    default:
                        Console.WriteLine("Error: Opción fuera de rango. Intente nuevamente.");
                        break;
                }
            }
            else
            {
                Console.WriteLine("Error: Por favor, ingrese un número válido.");
            }
        }
    }

    public ClientRequest AskClientData(Client? currentData)
    {
        Console.WriteLine(currentData == null ? "\n== REGISTRAR CLIENTE ==" : "\n== ACTUALIZAR CLIENTE ==");

        Console.Write($"Nombre{(currentData != null ? $" [{currentData.Name}]: " : ": ")}");
        string? name = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(name) && currentData != null)
            name = currentData.Name;

        Console.Write($"DNI{(currentData != null ? $" [{currentData.Dni}]: " : ": ")}");
        string? dni = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(dni) && currentData != null)
            dni = currentData.Dni;

        Console.Write($"Email{(currentData != null ? $" [{currentData.Email}]: " : ": ")}");
        string? email = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(email) && currentData != null)
            email = currentData.Email;

        Console.Write($"Teléfono{(currentData != null ? $" [{currentData.Phone}]: " : ": ")}");
        string? phone = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(phone) && currentData != null)
            phone = currentData.Phone;

        string labelStatus = currentData != null ? currentData.Status.GetLabel() : ClientStatus.Active.GetLabel();
        Console.WriteLine($"Status [{labelStatus}]: ");
        ClientStatus? status = AskClientStatus();
        if (status == null)
        {
            status = currentData != null ? currentData.Status : ClientStatus.Active;
        }

        Console.Write($"Usuario{(currentData != null ? $" [{currentData.Username}]: " : ": ")}");
        string? username = Console.ReadLine();
        if (string.IsNullOrWhiteSpace(username) && currentData != null)
            username = currentData.Username;

        string? password = null;
        if (currentData == null)
        {
            Console.Write("Contraseña: ");
            password = Console.ReadLine() ?? string.Empty;
        }

        return new ClientRequest(
            name ?? string.Empty,
            dni ?? string.Empty,
            email ?? string.Empty,
            phone ?? string.Empty,
            status.Value,
            username ?? string.Empty,
            password ?? string.Empty
        );
    }

    public long? AskId(string action)
    {
        Console.Write($"Ingrese el ID del cliente a {action}: ");
        string? input = Console.ReadLine();

        if (long.TryParse(input, out long id))
        {
            return id;
        }

        Console.WriteLine("Error: ID inválido.");
        return null;
    }

    public string AskDni()
    {
        Console.Write("Ingrese el DNI del cliente a buscar: ");
        return Console.ReadLine() ?? string.Empty;
    }

    public void ShowClients(List<Client> clients)
    {
        if (clients.Count == 0)
        {
            Console.WriteLine("No hay clientes registrados.");
            return;
        }

        Console.WriteLine("\n===================================== LISTADO DE CLIENTES ===============================================");
        Console.WriteLine($"{"Id",-10} {"Nombre",-20} {"DNI",-15} {"Correo electrónico",-25} {"Teléfono",-12} {"Estado",-10} {"Usuario Id",-10} {"Usuario",-20}");
        Console.WriteLine("---------------------------------------------------------------------------------------------------------");

        foreach (var c in clients)
        {
            long idSeguro = c.Id ?? 0;
            long userIdSeguro = c.UserId ?? 0;

            Console.WriteLine($"{idSeguro,-10} {c.Name,-20} {c.Dni,-15} {c.Email,-25} {c.Phone,-12} {c.Status.GetLabel(),-10} {userIdSeguro,-10} {c.Username,-20}");
        }
    }

    public void ShowClientDetails(Client c)
    {
        Console.WriteLine("\n=== DETALLE DEL CLIENTE ===");
        Console.WriteLine($"Id: {c.Id}");
        Console.WriteLine($"Nombre: {c.Name}");
        Console.WriteLine($"DNI: {c.Dni}");
        Console.WriteLine($"Correo electrónico: {c.Email}");
        Console.WriteLine($"Teléfono: {c.Phone}");
        Console.WriteLine($"Estado: {c.Status.GetLabel()}");
        Console.WriteLine($"Usuario Id: {c.UserId}");
        Console.WriteLine($"Usuario: {c.Username}");
    }

    public void ShowSuccess(string message)
    {
        Console.WriteLine($"✔ Éxito: {message}");
    }

    public void ShowError(string message)
    {
        Console.Error.WriteLine($"✘ Error: {message}");
    }

    private int ReadOption(int min, int max)
    {
        while (true)
        {
            Console.Write("Seleccione una opción: ");
            string? input = Console.ReadLine();

            if (int.TryParse(input, out int option) && option >= min && option <= max)
            {
                return option;
            }
            Console.WriteLine("Opción inválida o fuera de rango.");
        }
    }
}