import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Account } from "../dto/account";
import { AccountApi } from "../api/account.api";
import { executeApiCall } from "../utils/api.util";
import { HttpStatusCode } from "axios";

export function useAccountById() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Account | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const findById = async (id: number) => {
    try {
      setIsPending(true);
      setError(null);
      const response = await queryClient.fetchQuery({
        queryKey: ["account", id],
        queryFn: () =>
          executeApiCall(() => AccountApi.getById(id), {
            [HttpStatusCode.NotFound]: "La cuenta no existe",
          }),
      });
      setData(response.data);
    } catch (e) {
      if (e instanceof Error) setError(e);
      else setError(new Error("No se pudo obtener la cuenta"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    data,
    error,
    isPending,
    findById,
  };
}
