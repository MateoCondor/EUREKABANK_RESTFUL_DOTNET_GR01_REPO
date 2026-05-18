import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Account } from "../dto/account";
import { AccountApi } from "../api/account.api";
import { HttpStatusCode } from "axios";
import { executeApiCall } from "../utils/api.util";

export function useAccountByClient() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Account[] | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const findByClient = async (clientId: number) => {
    try {
      setIsPending(true);
      setError(null);
      const response = await queryClient.fetchQuery({
        queryKey: ["account", clientId],
        queryFn: () =>
          executeApiCall(() => AccountApi.getByClient(clientId), {
            [HttpStatusCode.NotFound]: "El cliente no existe",
          }),
      });
      setData(response.data);
    } catch (e) {
      if (e instanceof Error) setError(e);
      else setError(new Error("No se pudo obtener las cuentas"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    data,
    error,
    isPending,
    findByClient,
  };
}
