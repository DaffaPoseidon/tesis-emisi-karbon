import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { ChartProjectResponse } from "~/types/api/chart-project";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetChartByProjectId(id: string | number) {
  return useQuery({
    queryKey: ["chart-project", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<ChartProjectResponse[]>>(
        `/chart-project/${id}`,
      );
      if (response.data.data === null || response.data.data === null) return [];
      return response.data.data;
    },
  });
}
