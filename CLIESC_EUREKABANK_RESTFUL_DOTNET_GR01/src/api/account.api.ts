import { Account, AccountRequest, AccountUpdateRequest } from "../dto/account";
import { api } from "./api";

export class AccountApi {
  private static endpoint = "/accounts";

  static getAll() {
    return api.get<Account[]>(this.endpoint);
  }

  static getById(id: number) {
    return api.get<Account>(`${this.endpoint}/${id}`);
  }

  static getByClient(clientId: number) {
    return api.get<Account[]>(`${this.endpoint}/client/${clientId}`);
  }

  static create(dto: AccountRequest) {
    return api.post<Account>(`${this.endpoint}`, dto);
  }

  static updateStatus(id: number, dto: AccountUpdateRequest) {
    return api.put<Account>(`${this.endpoint}/${id}/status`, dto);
  }

  static getBalance(id: number) {
    return api.get<{ balance: number }>(`${this.endpoint}/${id}/balance`);
  }
}
