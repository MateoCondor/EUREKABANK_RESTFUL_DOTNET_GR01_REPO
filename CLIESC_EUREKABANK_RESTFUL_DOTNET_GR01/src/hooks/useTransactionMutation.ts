import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DepositRequest,
  TransferRequest,
  WithdrawRequest,
} from "../dto/transaction";
import { HttpStatusCode } from "axios";
import { executeApiCall } from "../utils/api.util";
import { TransactionApi } from "../api/transaction.api";

export function useTransactionMutation() {
  const queryClient = useQueryClient();

  const {
    mutateAsync: deposit,
    error: depositError,
    isPending: isDepositPending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: DepositRequest }) => {
      const { data } = await executeApiCall(() => TransactionApi.deposit(dto), {
        [HttpStatusCode.NotFound]: "No se encontró la cuenta",
      });
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      }),
  });

  const {
    mutateAsync: withdraw,
    error: withdrawError,
    isPending: isWithdrawPending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: WithdrawRequest }) => {
      const { data } = await executeApiCall(
        () => TransactionApi.withdraw(dto),
        {
          [HttpStatusCode.NotFound]: "No se encontró la cuenta",
        },
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      }),
  });

  const {
    mutateAsync: transfer,
    error: transferError,
    isPending: isTransferPending,
  } = useMutation({
    mutationFn: async ({ dto }: { dto: TransferRequest }) => {
      const { data } = await executeApiCall(
        () => TransactionApi.transfer(dto),
        {
          [HttpStatusCode.BadRequest]:
            "No se puede realizar la transacción. (Balance insuficiente o cantidad máxima de transferencias excedida)",
          [HttpStatusCode.NotFound]:
            "No se encontró la cuenta de origen o de destino o están inactivas",
        },
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
      }),
  });

  return {
    error: depositError || withdrawError || transferError,
    isPending: isDepositPending || isWithdrawPending || isTransferPending,
    deposit,
    withdraw,
    transfer,
  };
}
