namespace Ec.Edu.Monster.Model.Client;

using System;
using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Ec.Edu.Monster.Model.Dto;
using Ec.Edu.Monster.Model.Entity;
using Ec.Edu.Monster.Model.Service;
using Refit;

public class TransactionClient
{
    private readonly ITransactionService _service;

    public TransactionClient(ITransactionService service)
    {
        _service = service;
    }

    public async Task<List<Transaction>> GetByAccountIdAsync(long accountId)
    {
        try
        {
            return await _service.GetByAccountIdAsync(accountId);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("La cuenta no existe o no registra transacciones.", ex);
        }
    }

    public async Task<Transaction?> DepositAsync(DepositRequest dto)
    {
        try
        {
            return await _service.DepositAsync(dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.NotFound)
        {
            throw new Exception("La cuenta para el depósito no existe.", ex);
        }
    }

    public async Task<Transaction?> WithdrawAsync(WithdrawRequest dto)
    {
        try
        {
            return await _service.WithdrawAsync(dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.BadRequest)
        {
            throw new Exception("Fondos insuficientes para realizar el retiro.", ex);
        }
    }

    public async Task<Transaction?> TransferAsync(TransferRequest dto)
    {
        try
        {
            return await _service.TransferAsync(dto);
        }
        catch (ApiException ex) when (ex.StatusCode == HttpStatusCode.BadRequest)
        {
            throw new Exception("No se pudo procesar la transferencia. Verifique saldos o cuentas.", ex);
        }
    }
}