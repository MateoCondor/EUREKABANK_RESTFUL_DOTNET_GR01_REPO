namespace Ec.Edu.Monster.Utils;

using System.ComponentModel;
using System.Reflection;

public static class EnumExtensions
{
    public static string GetLabel(this Enum value)
    {
        FieldInfo? field = value.GetType().GetField(value.ToString());

        if (field != null)
        {
            var attribute = field.GetCustomAttribute<DescriptionAttribute>();
            if (attribute != null)
            {
                return attribute.Description;
            }
        }

        return value.ToString(); // Por si no tiene descripción
    }
}