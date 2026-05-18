import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AccountRequest, AccountUpdateRequest } from "../dto/account";
import { AccountApi } from "../api/account.api";
import { executeApiCall } from "../utils/api.util";
import { HttpStatusCode } from "axios";

export function useAccountMutation() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: create,
    error: createError,
    isPending: isCreatePending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: AccountRequest }) => {
      const { data } = await executeApiCall(() => AccountApi.create(dto), {
        [HttpStatusCode.NotFound]: "El cliente no existe",
      });

      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      }),
  });

  const {
    mutateAsync: updateStatus,
    error: updateStatusError,
    isPending: isUpdateStatusPending,
  } = useMutation({
    mutationFn: async ({
      id,
      dto,
    }: {
      id: number;
      dto: AccountUpdateRequest;
    }) => {
      const { data } = await executeApiCall(
        () => AccountApi.updateStatus(id, dto),
        {
          [HttpStatusCode.NotFound]: "El cliente no existe",
        },
      );

      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["accounts"],
      }),
  });

  return {
    error: createError || updateStatusError,
    isPending: isCreatePending || isUpdateStatusPending,
    create,
    updateStatus,
  };
}
