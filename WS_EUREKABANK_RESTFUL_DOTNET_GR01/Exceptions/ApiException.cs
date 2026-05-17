namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions
{
    public class ApiException : Exception
    {
        public int StatusCode { get; }

        public ApiException(string message, int statusCode) : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class AccountException : ApiException
    {
        public AccountException(string message, int statusCode) : base(message, statusCode) { }
    }

    public class AuthException : ApiException
    {
        public AuthException(string message, int statusCode) : base(message, statusCode) { }
    }

    public class ClientException : ApiException
    {
        public ClientException(string message, int statusCode) : base(message, statusCode) { }
    }

    public class ParameterException : ApiException
    {
        public ParameterException(string message, int statusCode) : base(message, statusCode) { }
    }

    public class TransactionException : ApiException
    {
        public TransactionException(string message, int statusCode) : base(message, statusCode) { }
    }
}
