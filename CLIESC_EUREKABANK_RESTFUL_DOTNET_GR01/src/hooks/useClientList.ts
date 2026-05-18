import { useQuery } from "@tanstack/react-query";
import { executeApiCall } from "../utils/api.util";
import { ClientApi } from "../api/client.api";

export function useClientList() {
  const { data, error, isPending } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data } = await executeApiCall(() => ClientApi.getAll());
      return data;
    },
    refetchOnWindowFocus: false,
  });

  return { data, error, isPending };
}
