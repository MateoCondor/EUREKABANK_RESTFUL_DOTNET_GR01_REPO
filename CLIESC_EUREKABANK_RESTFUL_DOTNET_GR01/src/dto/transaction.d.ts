import { TransactionType, TransferType } from "../enum/transaciton.enum";

export interface Transaction {
  id: number;
  type: TransactionType;
  transferType: TransferType;
  amount: number;
  fee: number;
  date: string;
  sourceAccountId: number;
  targetAccountId: number;
  description: string;
}

export interface DepositRequest {
  accountId: number;
  amount: number;
  description: string;
}

export interface WithdrawRequest {
  accountId: number;
  amount: number;
  description: string;
}

export interface TransferRequest {
  sourceAccountId: number;
  targetAccountId: number;
  amount: number;
  description: string;
  transferType: TransferType;
}
