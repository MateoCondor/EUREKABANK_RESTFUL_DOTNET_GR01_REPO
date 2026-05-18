namespace Ec.Edu.Monster.View;

using System;
using System.Collections.Generic;
using System.Globalization;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Enums;
using Ec.Edu.Monster.Utils; // Para usar .GetLabel() en tus enums

public class TransactionView
{
    // Formateador regional para dólares estadounidenses (Equivalente a Locale.US)
    private readonly CultureInfo _usCulture = new CultureInfo("en-US");
    private const string DateFormat = "yyyy-MM-dd HH:mm:ss";

    public int ShowSubMenu()
    {
        Console.WriteLine("\n--- MÓDULO DE TRANSACCIONES ---");
        Console.WriteLine("1. Ver historial de transacciones por Cuenta");
        Console.WriteLine("2. Realizar un Depósito");
        Console.WriteLine("3. Realizar un Retiro");
        Console.WriteLine("4. Realizar una Transferencia");
        Console.WriteLine("0. Volver al Menú Principal");
        return ReadOption(0, 4);
    }

    public DepositRequest AskDepositData()
    {
        Console.WriteLine("\n== REALIZAR DEPÓSITO ==");
        Console.Write("Id de la Cuenta de destino: ");
        long accountId = ReadLong();

        Console.Write("Monto a depositar: ");
        decimal amount = ReadDecimal();

        Console.Write("Descripción / Concepto: ");
        string desc = Console.ReadLine() ?? string.Empty;

        return new DepositRequest(accountId, amount, desc);
    }

    public WithdrawRequest AskWithdrawData()
    {
        Console.WriteLine("\n== REALIZAR RETIRO ==");
        Console.Write("Id de la Cuenta: ");
        long accountId = ReadLong();

        Console.Write("Monto a retirar: ");
        decimal amount = ReadDecimal();

        Console.Write("Descripción: ");
        string desc = Console.ReadLine() ?? string.Empty;

        return new WithdrawRequest(accountId, amount, desc);
    }

    public TransferType AskTransferType()
    {
        Console.WriteLine("Seleccione Tipo de transferencia:");
        Console.WriteLine("1. Crédito");
        Console.WriteLine("2. Débito");
        int typeOpt = ReadOption(1, 2);
        return typeOpt == 1 ? TransferType.Credit : TransferType.Debit;
    }

    public TransferRequest AskTransferData()
    {
        Console.WriteLine("\n== REALIZAR TRANSFERENCIA ==");
        Console.Write("Id de la Cuenta de ORIGEN: ");
        long sourceId = ReadLong();

        Console.Write("Id de la Cuenta de DESTINO: ");
        long targetId = ReadLong();

        Console.Write("Monto a transferir: ");
        decimal amount = ReadDecimal();

        Console.Write("Descripción: ");
        string desc = Console.ReadLine() ?? string.Empty;

        Console.WriteLine("Tipo de transferencia");
        TransferType transferType = AskTransferType();

        return new TransferRequest(sourceId, targetId, amount, desc, transferType);
    }

    public long AskAccountId()
    {
        Console.Write("Ingrese el Id de la cuenta para ver su historial: ");
        return ReadLong();
    }
    public void ShowHistory(List<Transaction> list)
    {
        if (list.Count == 0)
        {
            Console.WriteLine("No se registran transacciones para esta cuenta.");
            return;
        }

        Console.WriteLine("\n====================================== HISTORIAL DE TRANSACCIONES ======================================");
        Console.WriteLine($"{"Id",-6} {"Tipo",-12} {"Fecha",-20} {"Monto",-12} {"Comisión",-8} {"Origen",-10} {"Destino",-10} {"Descripción",-20}");
        Console.WriteLine("--------------------------------------------------------------------------------------------------------");

        foreach (var t in list)
        {
            // Como ya no son anulables, los convertimos a string directamente
            string source = t.SourceAccountId.ToString();
            string target = t.TargetAccountId.ToString() ?? "";
            string dateStr = t.Date.ToString(DateFormat);

            string amountStr = t.Amount.ToString("C", _usCulture);
            string feeStr = t.Fee.ToString("C", _usCulture);

            Console.WriteLine($"{t.Id,-6} {t.Type.GetLabel(),-12} {dateStr,-20} {amountStr,-12} {feeStr,-8} {source,-10} {target,-10} {(t.Description ?? ""),-20}");
        }
    }

    public void ShowReceipt(Transaction t, string message)
    {
        Console.WriteLine($"\n✔ {message}");
        Console.WriteLine("=========================================");
        Console.WriteLine("        COMPROBANTE DE OPERACIÓN        ");
        Console.WriteLine("=========================================");
        Console.WriteLine($"Transacción Id : {t.Id}");
        Console.WriteLine($"Tipo           : {t.Type.GetLabel()}");
        Console.WriteLine($"Monto          : {t.Amount.ToString("C", _usCulture)}");
        Console.WriteLine($"Comisión       : {t.Fee.ToString("C", _usCulture)}");
        Console.WriteLine($"Fecha/Hora     : {t.Date.ToString(DateFormat)}");

        // Al no ser nulos, EurekaBank suele usar '0' o un ID específico para transacciones globales (como depósitos)
        // Si deseas esconderlos cuando son 0, puedes evaluar: if(t.SourceAccountId != 0)
        Console.WriteLine($"Cuenta Origen  : {t.SourceAccountId}");
        Console.WriteLine($"Cuenta Destino : {t.TargetAccountId}");

        Console.WriteLine($"Detalle        : {t.Description}");
        Console.WriteLine("=========================================");
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
            Console.WriteLine("Opción fuera de rango o inválida.");
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
            Console.Write("Error: Ingrese un identificador numérico válido: ");
        }
    }

    private decimal ReadDecimal()
    {
        while (true)
        {
            string? input = Console.ReadLine();

            // Usamos NumberStyles e InvariantCulture/usCulture para asegurar el parseo correcto de decimales en consola
            if (decimal.TryParse(input, NumberStyles.Any, _usCulture, out decimal val))
            {
                if (val > 0)
                    return val;
                Console.WriteLine("El monto debe ser mayor a cero.");
            }
            else
            {
                Console.WriteLine("Error: Ingrese un monto decimal válido.");
            }
            Console.Write("Intente de nuevo: ");
        }
    }
}