namespace Ec.Edu.Monster.View;

using System;
using Ec.Edu.Monster.Model.Enums;
using Ec.Edu.Monster.Utils; // Para usar el método de extensión .GetLabel()

public class MainMenuView
{
    public int ShowMenu(string username, UserRole role)
    {
        Console.WriteLine("\n========================================");
        Console.WriteLine("   EUREKABANK - SISTEMA DE GESTIÓN");
        Console.WriteLine("========================================");
        Console.WriteLine($"Usuario: {username} | Rol: {role.GetLabel()}");
        Console.WriteLine("----------------------------------------");
        Console.WriteLine("1. Gestión de Clientes");
        Console.WriteLine("2. Gestión de Cuentas");
        Console.WriteLine("3. Gestión de Transacciones");
        Console.WriteLine("0. Cerrar Sesión y Salir");
        Console.WriteLine("----------------------------------------");

        return ReadOption(0, 3);
    }

    private int ReadOption(int min, int max)
    {
        while (true)
        {
            Console.Write("Seleccione una opción: ");
            string? input = Console.ReadLine();

            if (int.TryParse(input, out int option))
            {
                if (option >= min && option <= max)
                {
                    return option;
                }
                Console.WriteLine("Error: Opción fuera de rango. Intente nuevamente.");
            }
            else
            {
                Console.WriteLine("Error: Por favor, ingrese un número válido.");
            }
        }
    }

    public void ShowGoodbye()
    {
        Console.WriteLine("\nCerrando sesión... Gracias por usar EurekaBank.");
    }
}