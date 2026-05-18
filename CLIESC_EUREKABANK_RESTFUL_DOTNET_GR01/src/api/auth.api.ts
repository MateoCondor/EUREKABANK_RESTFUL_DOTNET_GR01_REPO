import { LoginRequest, LoginResponse } from "../dto/auth";
import { api } from "./api";

export class AuthApi {
  static login(dto: LoginRequest) {
    return api.post<LoginResponse>("/auth/login", dto);
  }
}
