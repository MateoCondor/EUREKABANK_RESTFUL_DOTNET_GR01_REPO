export const ClientStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type ClientStatus = (typeof ClientStatus)[keyof typeof ClientStatus];

export const ClientStatusLabel: Record<ClientStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
} as const;
