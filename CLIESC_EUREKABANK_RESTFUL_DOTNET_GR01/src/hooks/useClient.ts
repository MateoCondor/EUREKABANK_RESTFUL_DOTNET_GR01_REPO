import { useQueryClient } from "@tanstack/react-query";
import { executeApiCall } from "../utils/api.util";
import { ClientApi } from "../api/client.api";
import { useState } from "react";
import { Client } from "../dto/client";
import { HttpStatusCode } from "axios";

export function useClient() {
  const queryClient = useQueryClient();
  const [data, setData] = useState<Client | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const [isPending, setIsPending] = useState(false);

  const findById = async (id: number) => {
    try {
      setIsPending(true);
      setError(null);
      const response = await queryClient.fetchQuery({
        queryKey: ["client", id],
        queryFn: () =>
          executeApiCall(() => ClientApi.getById(id), {
            [HttpStatusCode.NotFound]: "El cliente no existe",
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

  const findByDni = async (dni: string) => {
    try {
      setIsPending(true);
      setError(null);
      const response = await queryClient.fetchQuery({
        queryKey: ["client", dni],
        queryFn: () =>
          executeApiCall(() => ClientApi.getByDni(dni), {
            [HttpStatusCode.NotFound]: "El cliente no existe",
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
    findById,
    findByDni,
  };
}
