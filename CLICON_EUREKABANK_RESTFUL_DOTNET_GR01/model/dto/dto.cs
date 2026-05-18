using System;
using System.Text.Json.Serialization;
using Ec.Edu.Monster.Model.Enums;

namespace Ec.Edu.Monster.Model.Dto;

// 1. AccountBalanceResponse.cs
public record AccountBalanceResponse(
    [property: JsonPropertyName("balance")] decimal Balance
);

// 2. AccountRequest.cs
public record AccountRequest(
    [property: JsonPropertyName("clientId")] long ClientId,
    [property: JsonPropertyName("type")] AccountType Type,
    [property: JsonPropertyName("status")] AccountStatus Status
);

// 3. AccountStatusRequest.cs
public record AccountStatusRequest(
    [property: JsonPropertyName("status")] AccountStatus Status
);

// 4. ClientRequest.cs
public record ClientRequest(
    [property: JsonPropertyName("name")] string Name,
    [property: JsonPropertyName("dni")] string Dni,
    [property: JsonPropertyName("email")] string Email,
    [property: JsonPropertyName("phone")] string Phone,
    [property: JsonPropertyName("status")] ClientStatus Status,
    [property: JsonPropertyName("username")] string Username,
    [property: JsonPropertyName("password")] string Password
);

// 5. DepositRequest.cs
public record DepositRequest(
    [property: JsonPropertyName("accountId")] long AccountId,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("description")] string Description
);

// 6. LoginRequest.cs
public record LoginRequest(
    [property: JsonPropertyName("username")] string Username,
    [property: JsonPropertyName("password")] string Password
);

// 7. LoginResponse.cs
public record LoginResponse(
    [property: JsonPropertyName("role")] UserRole Role,
    [property: JsonPropertyName("token")] string Token,
    [property: JsonPropertyName("username")] string Username
);

// 8. TransferRequest.cs
public record TransferRequest(
    [property: JsonPropertyName("sourceAccountId")] long SourceAccountId,
    [property: JsonPropertyName("targetAccountId")] long TargetAccountId,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("transferType")] TransferType TransferType
);

// 9. WithdrawRequest.cs
public record WithdrawRequest(
    [property: JsonPropertyName("accountId")] long AccountId,
    [property: JsonPropertyName("amount")] decimal Amount,
    [property: JsonPropertyName("description")] string Description
);