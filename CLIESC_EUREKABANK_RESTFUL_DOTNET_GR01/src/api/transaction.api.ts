import {
  DepositRequest,
  Transaction,
  TransferRequest,
  WithdrawRequest,
} from "../dto/transaction";
import { api } from "./api";

export class TransactionApi {
  private static endpoint = "/transactions";

  static getByAccount(accountId: number) {
    return api.get<Transaction[]>(`${this.endpoint}/account/${accountId}`);
  }

  static deposit(dto: DepositRequest) {
    return api.post<Transaction>(`${this.endpoint}/deposit`, dto);
  }

  static withdraw(dto: WithdrawRequest) {
    return api.post<Transaction>(`${this.endpoint}/withdraw`, dto);
  }

  static transfer(dto: TransferRequest) {
    return api.post<Transaction>(`${this.endpoint}/transfer`, dto);
  }
}
