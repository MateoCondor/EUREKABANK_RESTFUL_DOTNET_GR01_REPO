using Microsoft.AspNetCore.Mvc;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Controllers
{
    [ApiController]
    [Route("parameters")]
    public class ParameterController : ControllerBase
    {
        private readonly ParameterService _parameterService;

        public ParameterController(ParameterService parameterService)
        {
            _parameterService = parameterService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var parameters = await _parameterService.GetAllParameters();
            return Ok(parameters);
        }

        [HttpGet("{key}")]
        public async Task<IActionResult> GetByKey(string key)
        {
            var parameter = await _parameterService.GetByKey(key);
            return Ok(parameter);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ParameterDTO? request)
        {
            var created = await _parameterService.CreateParameter(request);
            return StatusCode(201, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(long id, [FromBody] ParameterDTO? request)
        {
            var updated = await _parameterService.UpdateParameter(id, request);
            return Ok(updated);
        }
    }
}
