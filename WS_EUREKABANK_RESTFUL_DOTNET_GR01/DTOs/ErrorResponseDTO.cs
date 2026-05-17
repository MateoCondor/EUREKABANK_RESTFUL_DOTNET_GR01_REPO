namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs
{
    public class ErrorResponseDTO
    {
        public string Message { get; set; } = string.Empty;

        public ErrorResponseDTO() { }

        public ErrorResponseDTO(string message)
        {
            Message = message;
        }
    }
}
