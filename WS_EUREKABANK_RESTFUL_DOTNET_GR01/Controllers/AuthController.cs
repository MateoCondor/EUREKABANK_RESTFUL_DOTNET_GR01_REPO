using Microsoft.AspNetCore.Mvc;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO? request)
        {
            var response = await _authService.Login(request);
            return Ok(response);
        }
    }
}
