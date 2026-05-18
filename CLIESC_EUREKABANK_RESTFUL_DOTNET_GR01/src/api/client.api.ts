import { Client, ClientRequest } from "../dto/client";
import { api } from "./api";

export class ClientApi {
  private static endpoint = "/clients";

  static getAll() {
    return api.get<Client[]>(this.endpoint);
  }

  static getById(id: number) {
    return api.get<Client>(`${this.endpoint}/${id}`);
  }

  static getByDni(dni: string) {
    return api.get<Client>(`${this.endpoint}/dni/${dni}`);
  }

  static create(dto: ClientRequest) {
    return api.post<Client>(`${this.endpoint}`, dto);
  }

  static update(id: number, dto: ClientRequest) {
    return api.put<Client>(`${this.endpoint}/${id}`, dto);
  }

  static delete(id: number) {
    return api.delete<void>(`${this.endpoint}/${id}`);
  }
}
