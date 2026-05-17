using Microsoft.AspNetCore.Mvc;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("accounts")]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var accounts = await _accountService.GetAllAccounts();
            return Ok(accounts);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(long id)
        {
            var account = await _accountService.GetAccountById(id);
            return Ok(account);
        }

        [HttpGet("client/{clientId}")]
        public async Task<IActionResult> GetByClient(long clientId)
        {
            var accounts = await _accountService.GetAccountsByClient(clientId);
            return Ok(accounts);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] AccountRequestDTO? request)
        {
            var created = await _accountService.CreateAccount(request);
            return StatusCode(201, created);
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(long id, [FromBody] AccountRequestDTO? request)
        {
            var status = request?.Status;
            var updated = await _accountService.UpdateStatus(id, status);
            return Ok(updated);
        }

        [HttpGet("{id}/balance")]
        public async Task<IActionResult> GetBalance(long id)
        {
            var balance = await _accountService.GetBalance(id);
            return Ok(new { balance });
        }
    }
}
