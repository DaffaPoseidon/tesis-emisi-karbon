import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { BaseResponse } from "~/types/constants/base-response";
import type { StatusData } from "~/types/constants/status-data";

export function useGetHistoryProjectByID(id: string) {
  return useQuery({
    queryKey: ["history-project", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<StatusData[]>>(
        `/history-project/project/${id}`,
      );
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
