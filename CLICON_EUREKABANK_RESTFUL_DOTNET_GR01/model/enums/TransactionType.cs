namespace Ec.Edu.Monster.Model.Enums;

using System.ComponentModel;

public enum TransactionType
{
    [Description("Depósito")]
    Deposit,

    [Description("Retiro")]
    Withdraw,

    [Description("Transferencia")]
    Transfer
}