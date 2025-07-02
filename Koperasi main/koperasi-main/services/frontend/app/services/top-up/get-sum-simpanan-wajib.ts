import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { SumResponse } from "~/types/api/top-up";

export function useGetSumSimpananWajib() {
  return useQuery({
    queryKey: ["sum-simpanan-wajib"],
    queryFn: async () => {
      const response = await httpClient.get<SumResponse>("/topup/simpanan_wajib");
      return response.data;
    },
  });
}
