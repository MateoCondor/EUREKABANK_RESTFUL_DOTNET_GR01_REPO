using Microsoft.Extensions.DependencyInjection;
using Refit;
using Ec.Edu.Monster.Interceptors;
using Ec.Edu.Monster.Model.Client;
using Ec.Edu.Monster.View;
using Ec.Edu.Monster.Controller;
using Ec.Edu.Monster.Model.Service;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Ec.Edu.Monster;

internal class Program
{
    private static async Task Main(string[] args)
    {
        Console.WriteLine("Iniciando Sistema EurekaBank...");

        // 1. Inicializamos el contenedor de servicios de .NET de forma directa
        var services = new ServiceCollection();

        // 2. Configuración de Serialización JSON para Refit
        var refitSettings = new RefitSettings
        {
            ContentSerializer = new SystemTextJsonContentSerializer(new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false,
                Converters = { new Utils.IsoDateTimeConverter(), new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) }

            })
        };
        // 3. Registrar el Interceptor de Red
        services.AddTransient<AuthInterceptor>();

        string baseUrl = "http://localhost:5170";

        // 4. Registrar los Clientes HTTP usando una instancia única de HttpClient compartida
        // Esto replica perfectamente tu lógica de Java usando HttpClientFactory interno de Refit
        services.AddSingleton(provider =>
        {
            var handler = provider.GetRequiredService<AuthInterceptor>();
            // Adjuntamos el interceptor al manejador de red nativo
            var clientHandler = new HttpClientHandler();
            handler.InnerHandler = clientHandler;

            return new HttpClient(handler) { BaseAddress = new Uri(baseUrl) };
        });

        // 5. Instanciar los clientes con la configuración compartida
        services.AddSingleton(provider =>
            new AuthClient(RestService.For<IAuthService>(provider.GetRequiredService<HttpClient>(), refitSettings)));

        services.AddSingleton(provider =>
            new AccountClient(RestService.For<IAccountService>(provider.GetRequiredService<HttpClient>(), refitSettings)));

        services.AddSingleton(provider =>
            new ClientClient(RestService.For<IClientService>(provider.GetRequiredService<HttpClient>(), refitSettings)));

        services.AddSingleton(provider =>
            new TransactionClient(RestService.For<ITransactionService>(provider.GetRequiredService<HttpClient>(), refitSettings)));

        // 6. Registrar las Vistas de Consola (Singletons)
        services.AddSingleton<LoginView>();
        services.AddSingleton<MainMenuView>();
        services.AddSingleton<AccountView>();
        services.AddSingleton<ClientView>();
        services.AddSingleton<TransactionView>();

        // 7. Registrar los Controladores (Singletons)
        services.AddSingleton<LoginController>();
        services.AddSingleton<MainMenuController>();
        services.AddSingleton<AccountController>();
        services.AddSingleton<ClientController>();
        services.AddSingleton<TransactionController>();

        // 8. Construir el Proveedor de Servicios final
        using var serviceProvider = services.BuildServiceProvider();

        // -------------------------------------------------------------
        // ARRANQUE ORDENADO DE LA APLICACIÓN BANCARIA
        // -------------------------------------------------------------
        var loginController = serviceProvider.GetRequiredService<LoginController>();
        var mainMenuController = serviceProvider.GetRequiredService<MainMenuController>();

        // Ejecutamos el flujo de Login
        var sessionResult = await loginController.RunAsync();

        if (sessionResult != null)
        {
            // Si las credenciales fueron correctas, saltamos al menú principal
            await mainMenuController.RunAsync();
        }
        else
        {
            Console.WriteLine("\nAplicación finalizada por seguridad.");
        }
    }
}