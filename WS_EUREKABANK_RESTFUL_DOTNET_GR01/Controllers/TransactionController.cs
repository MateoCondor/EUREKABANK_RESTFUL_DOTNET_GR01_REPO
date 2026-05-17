using Microsoft.AspNetCore.Mvc;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("transactions")]
    public class TransactionController : ControllerBase
    {
        private readonly TransactionService _transactionService;

        public TransactionController(TransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit([FromBody] DepositDTO? request)
        {
            var response = await _transactionService.Deposit(request);
            return StatusCode(201, response);
        }

        [HttpPost("withdraw")]
        public async Task<IActionResult> Withdraw([FromBody] WithdrawDTO? request)
        {
            var response = await _transactionService.Withdraw(request);
            return StatusCode(201, response);
        }

        [HttpPost("transfer")]
        public async Task<IActionResult> Transfer([FromBody] TransferDTO? request)
        {
            var response = await _transactionService.Transfer(request);
            return StatusCode(201, response);
        }

        [HttpGet("account/{accountId}")]
        public async Task<IActionResult> GetByAccount(long accountId)
        {
            var transactions = await _transactionService.GetTransactionsByAccount(accountId);
            return Ok(transactions);
        }
    }
}
