namespace Ec.Edu.Monster.View;

using System;
using System.Collections.Generic;
using System.Globalization;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Enums;
using Ec.Edu.Monster.Utils; // Para usar el método .GetLabel() de tus enums

public class AccountView
{
    // Formateador regional para moneda configurado en US (equivalente a Locale.US)
    private readonly CultureInfo _usCulture = new CultureInfo("en-US");

    public int ShowSubMenu()
    {
        Console.WriteLine("\n--- GESTIÓN DE CUENTAS ---");
        Console.WriteLine("1. Listar todas las cuentas");
        Console.WriteLine("2. Buscar cuenta por ID");
        Console.WriteLine("3. Consultar saldo de una cuenta");
        Console.WriteLine("4. Listar cuentas de un cliente");
        Console.WriteLine("5. Abrir nueva cuenta");
        Console.WriteLine("6. Cambiar estado de cuenta (Activar/Bloquear)");
        Console.WriteLine("0. Volver al Menú Principal");
        return ReadOption(0, 6);
    }

    public AccountRequest AskAccountData()
    {
        Console.WriteLine("\n== APERTURA DE CUENTA ==");

        Console.Write("Ingrese el ID del Cliente titular: ");
        long clientId = ReadLong();

        Console.WriteLine("Seleccione Tipo de Cuenta:");
        Console.WriteLine("1. AHORROS");
        Console.WriteLine("2. CORRIENTE");
        int typeOpt = ReadOption(1, 2);
        AccountType type = (typeOpt == 1) ? AccountType.Savings : AccountType.Current;

        return new AccountRequest(clientId, type, AccountStatus.Active);
    }

    public AccountStatusRequest AskStatusUpdate(AccountStatus currentStatus)
    {
        Console.WriteLine("\n== CAMBIAR ESTADO DE CUENTA ==");
        Console.WriteLine($"Estado actual: {currentStatus.GetLabel()}");
        Console.WriteLine("Seleccione el nuevo estado:");
        Console.WriteLine("1. ACTIVA");
        Console.WriteLine("2. BLOQUEADA");

        int opt = ReadOption(1, 2);
        AccountStatus newStatus = (opt == 1) ? AccountStatus.Active : AccountStatus.Blocked;
        return new AccountStatusRequest(newStatus);
    }

    public long AskAccountId(string action)
    {
        Console.Write($"Ingrese el ID de la cuenta para {action}: ");
        return ReadLong();
    }

    public long AskClientId()
    {
        Console.Write("Ingrese el ID del cliente para listar sus cuentas: ");
        return ReadLong();
    }

    public void ShowAccounts(List<Account> accounts)
    {
        if (accounts.Count == 0) // .Count se prefiere en .NET sobre .IsEmpty() o .Count() de LINQ
        {
            Console.WriteLine("No se encontraron cuentas.");
            return;
        }

        Console.WriteLine("\n================================== LISTADO DE CUENTAS ==================================");
        // String formatting en C# mantiene una sintaxis casi idéntica a Java para anchos de columna
        Console.WriteLine($"{"Id",-10} {"Número cuenta",-20} {"Saldo",-15} {"Tipo",-12} {"Estado",-12} {"Cliente Id",-10}");
        Console.WriteLine("----------------------------------------------------------------------------------------");

        foreach (var a in accounts)
        {
            // Formateamos el decimal directamente pasando el formato "C" (Currency) y la cultura regional
            string balanceFormateado = a.Balance.ToString("C", _usCulture);
            long idSeguro = a.Id ?? 0; // Manejo por si el ID llega a ser nulo

            Console.WriteLine($"{idSeguro,-10} {a.AccountNumber,-20} {balanceFormateado,-15} {a.Type.GetLabel(),-12} {a.Status.GetLabel(),-12} {a.ClientId,-10}");
        }
    }

    public void ShowAccountDetails(Account a)
    {
        Console.WriteLine("\n=== DETALLE DE LA CUENTA ===");
        Console.WriteLine($"ID: {a.Id}");
        Console.WriteLine($"Número de Cuenta: {a.AccountNumber}");
        Console.WriteLine($"Saldo Disponible: {a.Balance.ToString("C", _usCulture)}");
        Console.WriteLine($"Tipo: {a.Type.GetLabel()}");
        Console.WriteLine($"Estado: {a.Status.GetLabel()}");
        Console.WriteLine($"ID Titular (Cliente): {a.ClientId}");
    }

    public void ShowBalance(decimal balance)
    {
        Console.WriteLine("\n=================================");
        Console.WriteLine($" SALDO ACTUAL: {balance.ToString("C", _usCulture)}");
        Console.WriteLine("=================================");
    }

    public void ShowSuccess(String message)
    {
        Console.WriteLine($"✔ Éxito: {message}");
    }

    public void ShowError(String message)
    {
        // Console.Error redirige el flujo al stream de errores del sistema, igual que System.err
        Console.Error.WriteLine($"✘ Error: {message}");
    }

    private int ReadOption(int min, int max)
    {
        while (true)
        {
            Console.Write("Seleccione una opción: ");
            string? input = Console.ReadLine();

            // int.TryParse intenta convertir el texto a número sin lanzar excepciones costosas si falla
            if (int.TryParse(input, out int option))
            {
                if (option >= min && option <= max)
                {
                    return option;
                }
                Console.WriteLine("Opción fuera de rango.");
            }
            else
            {
                Console.WriteLine("Ingrese un número válido.");
            }
        }
    }

    private long ReadLong()
    {
        while (true)
        {
            string? input = Console.ReadLine();

            if (long.TryParse(input, out long val))
            {
                return val;
            }

            Console.WriteLine("Error: Debe ingresar un ID numérico válido. Intente de nuevo: ");
        }
    }
}