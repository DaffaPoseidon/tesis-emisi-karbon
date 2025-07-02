import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TopUpResponse } from "~/types/api/top-up";
import type { BaseResponse } from "~/types/constants/base-response";

interface GetAllSaldoProps {
  isDashboard?: boolean;
}

export function useGetAllSaldo({ isDashboard = false }: GetAllSaldoProps) {
  return useQuery({
    queryKey: ["saldo"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<TopUpResponse[]>>("/topup/saldo");
      if (response.data.data === undefined) return [];
      if (isDashboard) {
        return response.data.data.slice(0, 10);
      }
      return response.data.data;
    },
  });
}
