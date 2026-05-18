import { useMutation } from "@tanstack/react-query";
import { executeApiCall } from "../utils/api.util";
import { AuthApi } from "../api/auth.api";
import { LoginRequest } from "../dto/auth";
import { HttpStatusCode } from "axios";

const TOKEN_KEY = "TOKEN";
const USERNAME_KEY = "USERNAME";
const ROLE_KEY = "ROLE";

export function useAuth() {
  const {
    mutateAsync: login,
    error: loginError,
    isPending: isLoginPending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: LoginRequest }) => {
      const { data } = await executeApiCall(() => AuthApi.login(dto), {
        [HttpStatusCode.BadRequest]: "Las credenciales son inválidas",
        [HttpStatusCode.NotFound]: "Usuario o contraseña incorrectas",
      });
      return data;
    },
    onSuccess: (response) => {
      localStorage.setItem(TOKEN_KEY, response.token);
      localStorage.setItem(USERNAME_KEY, response.token);
      localStorage.setItem(ROLE_KEY, response.token);
    },
  });

  return {
    login,
    error: loginError,
    isPending: isLoginPending,
  };
}
