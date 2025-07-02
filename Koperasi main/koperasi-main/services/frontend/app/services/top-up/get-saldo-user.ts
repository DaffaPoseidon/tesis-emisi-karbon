import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { SumResponse } from "~/types/api/top-up";

export function useGetSaldoUser() {
  return useQuery({
    queryKey: ["sum-saldo-user"],
    queryFn: async () => {
      const response = await httpClient.get<SumResponse>("/topup/saldo/user");
      return response.data;
    },
  });
}
