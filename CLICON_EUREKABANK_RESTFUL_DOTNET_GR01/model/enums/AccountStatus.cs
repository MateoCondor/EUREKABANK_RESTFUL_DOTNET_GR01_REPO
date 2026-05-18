namespace Ec.Edu.Monster.Model.Enums;

using System.ComponentModel;

public enum AccountStatus
{
    [Description("Activa")]
    Active,

    [Description("Bloqueada")]
    Blocked,

    [Description("Cerrada")]
    Closed
}