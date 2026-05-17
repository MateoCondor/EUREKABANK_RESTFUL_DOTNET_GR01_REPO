using Microsoft.AspNetCore.Mvc;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("/")]
    public class HomeController : ControllerBase
    {
        [HttpGet]
        public IActionResult Home()
        {
            return Ok(new
            {
                name = "EUREKABANK REST API",
                status = "UP",
                loginEndpoint = "/auth/login"
            });
        }
    }
}
