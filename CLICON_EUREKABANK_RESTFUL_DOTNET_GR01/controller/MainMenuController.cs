namespace Ec.Edu.Monster.Controller;

using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Enums;
using Ec.Edu.Monster.View;

public class MainMenuController
{
    private readonly MainMenuView _view;
    private readonly ClientController _clientController;
    private readonly AccountController _accountController;
    private readonly TransactionController _transactionController;

    // Constructor listo para la inyección de dependencias centralizada
    public MainMenuController(
        MainMenuView view,
        ClientController clientController,
        AccountController accountController,
        TransactionController transactionController)
    {
        _view = view;
        _clientController = clientController;
        _accountController = accountController;
        _transactionController = transactionController;
    }

    // Método principal asíncrono que mantiene vivo el hilo de la consola
    public async Task RunAsync()
    {
        // En C# accedemos a la propiedad estática Instance del Singleton
        UserSession session = UserSession.Instance;
        bool running = true;

        while (running)
        {
            int option = _view.ShowMenu(session.Username ?? "Guest", session.Role ?? UserRole.Client);

            switch (option)
            {
                case 1:
                    // Esperamos a que el módulo de clientes termine su ejecución
                    await _clientController.RunAsync();
                    break;
                case 2:
                    // Esperamos a que el módulo de cuentas termine su ejecución
                    await _accountController.RunAsync();
                    break;
                case 3:
                    // Esperamos a que el módulo de transacciones termine su ejecución
                    await _transactionController.RunAsync();
                    break;
                case 0:
                    _view.ShowGoodbye();
                    session.Clear(); // Limpiamos credenciales/tokens de la sesión actual
                    running = false;
                    break;
            }
        }
    }
}