namespace Ec.Edu.Monster.View;

using System;

public class LoginView
{
    // Record anidado dentro de la clase (igual que en Java)
    public record LoginData(string Username, string Password);

    public LoginData ShowLogin()
    {
        Console.WriteLine("\n========================================");
        Console.WriteLine("         CLICON RESTFUL - DOTNET GR01     ");
        Console.WriteLine("               INICIO DE SESIÓN           ");
        Console.WriteLine("\n========================================");
        Console.WriteLine("----------------------------------------");

        Console.Write("Usuario: ");
        // Usamos el operador ?? para asegurar que si el input es nulo, guarde un string vacío
        string username = Console.ReadLine() ?? string.Empty;

        Console.Write("Contraseña: ");
        string password = Console.ReadLine() ?? string.Empty;

        Console.WriteLine("----------------------------------------");

        return new LoginData(username, password);
    }

    public void ShowError(string message)
    {
        Console.WriteLine($"Error: {message}");
    }

    public void ShowWelcome(string username)
    {
        Console.WriteLine($"Bienvenido {username}");
    }
}