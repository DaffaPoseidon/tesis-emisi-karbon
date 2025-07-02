import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

interface KasKoperasiResponse {
  message: string;
  total: number;
}

export function useGetKasKoperasi() {
  return useQuery({
    queryKey: ["kas-koperasi"],
    queryFn: async () => {
      const response = await httpClient.get<KasKoperasiResponse>("/topup/kas-koperasi");
      return response.data;
    },
  });
}
