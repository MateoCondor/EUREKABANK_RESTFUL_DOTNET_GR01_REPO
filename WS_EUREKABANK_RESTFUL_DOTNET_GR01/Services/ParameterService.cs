using Microsoft.EntityFrameworkCore;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Data;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.DTOs;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Exceptions;
using WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models;

namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Services
{
    public class ParameterService
    {
        private readonly ApplicationDbContext _context;

        public ParameterService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ParameterDTO>> GetAllParameters()
        {
            var parameters = await _context.Parameters.OrderBy(p => p.Key).ToListAsync();
            return parameters.Select(ToDTO).ToList();
        }

        public async Task<ParameterDTO> GetByKey(string? key)
        {
            if (string.IsNullOrWhiteSpace(key))
                throw new ParameterException("Parameter key is required", 400);
            string trimmedKey = key.Trim();
            var parameter = await _context.Parameters.FirstOrDefaultAsync(p => p.Key == trimmedKey);
            if (parameter == null)
                throw new ParameterException($"Parameter not found: {key}", 404);
            return ToDTO(parameter);
        }

        public async Task<ParameterDTO> CreateParameter(ParameterDTO? request)
        {
            if (request == null) throw new ParameterException("Request body is required", 400);
            if (string.IsNullOrWhiteSpace(request.Key)) throw new ParameterException("Parameter key is required", 400);
            if (string.IsNullOrWhiteSpace(request.Value)) throw new ParameterException("Parameter value is required", 400);
            string normalizedKey = request.Key.Trim();
            if (await _context.Parameters.AnyAsync(p => p.Key == normalizedKey))
                throw new ParameterException($"Parameter already exists with key: {normalizedKey}", 409);
            var parameter = new Parameter { Key = normalizedKey, Value = request.Value.Trim(), Description = request.Description?.Trim() };
            _context.Parameters.Add(parameter);
            await _context.SaveChangesAsync();
            return ToDTO(parameter);
        }

        public async Task<ParameterDTO> UpdateParameter(long id, ParameterDTO? request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Value))
                throw new ParameterException("Parameter value is required", 400);
            var parameter = await _context.Parameters.FindAsync(id);
            if (parameter == null) throw new ParameterException("Parameter not found", 404);
            parameter.Value = request.Value.Trim();
            parameter.Description = request.Description?.Trim();
            await _context.SaveChangesAsync();
            return ToDTO(parameter);
        }

        public async Task<string> RequireValue(string key)
        {
            var p = await _context.Parameters.FirstOrDefaultAsync(x => x.Key == key);
            if (p == null) throw new ParameterException($"Required system parameter not configured: {key}", 500);
            return p.Value;
        }

        public async Task<string> GetValueOrDefault(string key, string defaultValue)
        {
            var p = await _context.Parameters.FirstOrDefaultAsync(x => x.Key == key);
            return p?.Value ?? defaultValue;
        }

        private static ParameterDTO ToDTO(Parameter p) => new() { Id = p.Id, Key = p.Key, Value = p.Value, Description = p.Description };
    }
}
