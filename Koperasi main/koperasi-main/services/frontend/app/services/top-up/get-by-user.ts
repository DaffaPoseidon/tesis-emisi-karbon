import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TopUpResponse } from "~/types/api/top-up";
import type { BaseResponse } from "~/types/constants/base-response";

interface GetAllTopUpProps {
  isDashboard?: boolean;
}

export function useGetAllTopUpByUser({ isDashboard = false }: GetAllTopUpProps) {
  return useQuery({
    queryKey: ["top-up"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<TopUpResponse[]>>("/topup/user");
      if (response.data.data === undefined) return [];
      if (isDashboard) {
        return response.data.data.slice(0, 10);
      }
      return response.data.data;
    },
  });
}
