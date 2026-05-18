import { AccountStatus, AccountType } from "../enum/account.enum";

export interface Account {
  id: number;
  accountNumber: string;
  balance: number;
  status: AccountStatus;
  type: AccountType;
  clientId: number;
}

export interface AccountRequest {
  clientId: number;
  type: AccountType;
  status: AccountStatus;
}

export interface AccountUpdateRequest {
  status: AccountStatus;
}
