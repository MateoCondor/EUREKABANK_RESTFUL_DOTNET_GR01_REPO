export const TransactionType = {
  DEPOSIT: "DEPOSIT",
  WITHDRAW: "WITHDRAW",
  TRANSFER: "TRANSFER",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const TransactionTypeLabel: Record<TransactionType, string> = {
  DEPOSIT: "Depósito",
  WITHDRAW: "Retiro",
  TRANSFER: "Transferencia",
} as const;

export const TransferType = {
  CREDIT: "CREDIT",
  DEBIT: "DEBIT",
} as const;

export type TransferType = (typeof TransferType)[keyof typeof TransferType];

export const TransferTypeLabel: Record<TransferType, string> = {
  CREDIT: "Crédito",
  DEBIT: "Débito",
} as const;
