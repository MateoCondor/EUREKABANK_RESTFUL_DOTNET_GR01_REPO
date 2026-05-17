namespace WS_EUREKABANK_RESTFUL_DOTNET_GR01.Models
{
    /// <summary>
    /// Subtypes of a TRANSFER transaction.
    /// CREDIT – The source account holder pushes money to the target (classic wire transfer).
    /// DEBIT  – The target account holder pulls money from the source (direct debit).
    /// </summary>
    public enum TransferType
    {
        CREDIT,
        DEBIT
    }
}
