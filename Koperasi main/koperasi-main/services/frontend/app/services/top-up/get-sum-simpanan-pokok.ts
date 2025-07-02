import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { SumResponse } from "~/types/api/top-up";

export function useGetSumSimpananPokok() {
  return useQuery({
    queryKey: ["sum-simpanan-pokok"],
    queryFn: async () => {
      const response = await httpClient.get<SumResponse>("/topup/simpanan_pokok");
      return response.data;
    },
  });
}
