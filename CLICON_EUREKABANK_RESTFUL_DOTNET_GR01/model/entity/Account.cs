namespace Ec.Edu.Monster.Model.Entity;

using System.Text.Json.Serialization;
using Ec.Edu.Monster.Model.Enums;

public class Account
{
    [JsonPropertyName("id")]
    public long? Id { get; set; }

    [JsonPropertyName("accountNumber")]
    public string AccountNumber { get; set; } = string.Empty;

    [JsonPropertyName("balance")]
    public decimal Balance { get; set; }

    [JsonPropertyName("status")]
    public AccountStatus Status { get; set; }

    [JsonPropertyName("type")]
    public AccountType Type { get; set; }

    [JsonPropertyName("clientId")]
    public long ClientId { get; set; }
}