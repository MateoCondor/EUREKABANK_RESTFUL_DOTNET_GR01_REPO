import { useQuery } from "@tanstack/react-query";
import { AccountApi } from "../api/account.api";
import { executeApiCall } from "../utils/api.util";

export function useAccountList() {
  const { data, error, isPending } = useQuery({
    queryKey: ["accounts"],
    queryFn: async () => {
      const { data } = await executeApiCall(() => AccountApi.getAll());
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return { data, error, isPending };
}
