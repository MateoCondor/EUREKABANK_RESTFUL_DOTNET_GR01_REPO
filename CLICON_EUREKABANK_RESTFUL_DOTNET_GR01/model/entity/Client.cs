namespace Ec.Edu.Monster.Model.Entity;

using System.Text.Json.Serialization;
using Ec.Edu.Monster.Model.Enums;

public class Client
{
    [JsonPropertyName("id")]
    public long? Id { get; set; }

    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("dni")]
    public string Dni { get; set; } = string.Empty;

    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;

    [JsonPropertyName("phone")]
    public string Phone { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public ClientStatus Status { get; set; }

    [JsonPropertyName("userId")]
    public long? UserId { get; set; }

    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
}