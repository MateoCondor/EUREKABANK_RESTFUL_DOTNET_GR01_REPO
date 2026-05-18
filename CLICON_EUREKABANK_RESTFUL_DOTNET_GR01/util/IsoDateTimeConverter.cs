namespace Ec.Edu.Monster.Utils;

using System;
using System.Text.Json;
using System.Text.Json.Serialization;

public class IsoDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // Intenta parsear cualquier variante de formato ISO 8601 automáticamente
        return reader.GetDateTime();
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        // Lo escribe siempre en formato ISO limpio (con la 'T' en medio)
        writer.WriteStringValue(value.ToString("yyyy-MM-ddTHH:mm:ss.fff"));
    }
}