namespace Ec.Edu.Monster.Model.Service;

using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Refit;

public interface IAuthService
{
    [Post("/auth/login")]
    Task<LoginResponse> LoginAsync([Body] LoginRequest dto);
}