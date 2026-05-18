import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClientRequest } from "../dto/client";
import { ClientApi } from "../api/client.api";
import { executeApiCall } from "../utils/api.util";
import { HttpStatusCode } from "axios";

export function useClientMutation() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: create,
    error: createError,
    isPending: isCreatePending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: ClientRequest }) => {
      const { data } = await executeApiCall(() => ClientApi.create(dto), {
        [HttpStatusCode.Conflict]: "El DNI o nombre de usuario ya existe",
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      }),
  });

  const {
    mutateAsync: update,
    error: updateError,
    isPending: isUpdatePending,
  } = useMutation({
    mutationFn: async ({ id, dto }: { id: number; dto: ClientRequest }) => {
      const { data } = await executeApiCall(() => ClientApi.update(id, dto), {
        [HttpStatusCode.NotFound]: "El cliente no existe",
        [HttpStatusCode.Conflict]: "El DNI ya esta siendo utilizado",
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      }),
  });

  const {
    mutateAsync: remove,
    error: removeError,
    isPending: isRemovePending,
  } = useMutation({
    mutationFn: async ({ id }: { id: number }) => {
      const { data } = await executeApiCall(() => ClientApi.delete(id), {
        [HttpStatusCode.NotFound]: "El cliente no existe",
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      }),
  });

  return {
    error: createError || updateError || removeError,
    isPending: isCreatePending || isUpdatePending || isRemovePending,
    create,
    update,
    remove,
  };
}
