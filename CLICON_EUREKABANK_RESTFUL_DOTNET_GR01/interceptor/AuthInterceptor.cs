namespace Ec.Edu.Monster.Interceptors;

using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Entity;

public class AuthInterceptor : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        // 1. Obtener el token desde nuestro Singleton UserSession
        string? token = UserSession.Instance.Token;

        // 2. Si el token existe, lo inyectamos en la cabecera Authorization
        if (!string.IsNullOrEmpty(token))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }

        // 3. Continuar con la cadena de ejecución de la petición (Equivalente al chain.proceed)
        return await base.SendAsync(request, cancellationToken);
    }
}