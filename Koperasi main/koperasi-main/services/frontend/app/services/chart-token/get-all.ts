import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { ChartProjectByUserResponse } from "~/types/api/chart-project";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllChartToken() {
  return useQuery({
    queryKey: ["chart-project"],
    queryFn: async () => {
      const response =
        await httpClient.get<BaseResponse<ChartProjectByUserResponse[]>>("/chart-token/user");
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
