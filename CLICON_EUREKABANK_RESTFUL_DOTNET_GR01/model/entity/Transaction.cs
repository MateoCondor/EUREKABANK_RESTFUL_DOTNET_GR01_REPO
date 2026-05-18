namespace Ec.Edu.Monster.Model.Entity;

using System;
using System.Text.Json.Serialization;
using Ec.Edu.Monster.Model.Enums;

public class Transaction
{
    [JsonPropertyName("id")]
    public long? Id { get; set; }

    [JsonPropertyName("type")]
    public TransactionType Type { get; set; }

    [JsonPropertyName("transferType")]
    public TransferType? TransferType { get; set; }

    [JsonPropertyName("amount")]
    public decimal Amount { get; set; }

    [JsonPropertyName("fee")]
    public decimal? Fee { get; set; }

    [JsonPropertyName("date")]
    public DateTime Date { get; set; } = DateTime.Now;

    [JsonPropertyName("sourceAccountId")]
    public long SourceAccountId { get; set; }

    [JsonPropertyName("targetAccountId")]
    public long? TargetAccountId { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; } = string.Empty;
}