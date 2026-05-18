namespace Ec.Edu.Monster.Model.Entity;

using Ec.Edu.Monster.Model.Enums;

public class UserSession
{
    // C# inicializa de forma segura para hilos de manera nativa al usar instanciación estática directa
    private static readonly UserSession _instance = new UserSession();

    // Propiedades con getters públicos y setters privados
    public string? Token { get; private set; }
    public string? Username { get; private set; }
    public UserRole? Role { get; private set; }

    // Constructor privado para evitar instanciación externa
    private UserSession()
    {
    }

    // Propiedad estática para obtener la instancia única
    public static UserSession Instance => _instance;

    public void SaveSession(string token, string username, UserRole role)
    {
        Token = token;
        Username = username;
        Role = role;
    }

    public void Clear()
    {
        Token = null;
        Username = null;
        Role = null;
    }

    // En C# usamos una propiedad calculada (get) en lugar de un método con prefijo "is"
    public bool IsLoggedIn => Token != null;
}