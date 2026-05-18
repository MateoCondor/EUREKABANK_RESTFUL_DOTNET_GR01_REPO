export const AccountStatus = {
  ACTIVE: "ACTIVE",
  BLOCKED: "BLOCKED",
  CLOSED: "CLOSED",
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const AccountStatusLabel: Record<AccountStatus, string> = {
  ACTIVE: "Activa",
  BLOCKED: "Bloqueada",
  CLOSED: "Cerrada",
} as const;

export const AccountType = {
  SAVINGS: "SAVINGS",
  CURRENT: "CURRENT",
} as const;

export type AccountType = (typeof AccountType)[keyof typeof AccountType];

export const AccountTypeLabel: Record<AccountType, string> = {
  SAVINGS: "Ahorros",
  CURRENT: "Corriente",
} as const;
