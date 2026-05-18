import { ClientStatus } from "../enum/client.enum";

export interface ClientRequest {
  name: string;
  dni: string;
  email: string;
  phone: string;
  status: ClientStatus;
  username: string;
  password: string | null;
}

export interface Client {
  id: number;
  name: string;
  dni: string;
  email: string;
  phone: string;
  status: ClientStatus;
  userId: number;
  username: string;
}
