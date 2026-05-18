import { useQueryClient } from "@tanstack/react-query";
import { executeApiCall } from "../utils/api.util";
import { TransactionApi } from "../api/transaction.api";
import { HttpStatusCode } from "axios";
import { useState } from "react";
import { Transaction } from "../dto/transaction";

export function useTransaction() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Transaction[] | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const findByAccount = async (id: number) => {
    try {
      setIsPending(true);
      setError(null);
      const response = await queryClient.fetchQuery({
        queryKey: ["transactions", id],
        queryFn: () =>
          executeApiCall(() => TransactionApi.getByAccount(id), {
            [HttpStatusCode.NotFound]: "La cuenta no existe",
          }),
      });
      setData(response.data);
    } catch (e) {
      if (e instanceof Error) setError(e);
      else setError(new Error("No se pudo obtener el usuario"));
    } finally {
      setIsPending(false);
    }
  };

  return {
    data,
    error,
    isPending,
    findByAccount,
  };
}
