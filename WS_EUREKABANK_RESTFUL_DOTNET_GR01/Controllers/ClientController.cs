using Microsoft.AspNetCore.Mvc;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("clients")]
    public class ClientController : ControllerBase
    {
        private readonly ClientService _clientService;

        public ClientController(ClientService clientService)
        {
            _clientService = clientService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var clients = await _clientService.GetAllClients();
            return Ok(clients);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var client = await _clientService.GetClientById(id);
            return Ok(client);
        }

        [HttpGet("dni/{dni}")]
        public async Task<IActionResult> GetByDni(string dni)
        {
            var client = await _clientService.FindByDni(dni);
            return Ok(client);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ClientRequestDTO? request)
        {
            var created = await _clientService.CreateClient(request);
            return StatusCode(201, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] ClientRequestDTO? request)
        {
            var updated = await _clientService.UpdateClient(id, request);
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(long id)
        {
            await _clientService.DeleteClient(id);
            return Ok(new { message = "Client deleted" });
        }
    }
}
