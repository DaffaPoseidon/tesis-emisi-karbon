import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { HistoryTokenResponse } from "~/types/api/history-token";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetHistoryTokenByID(id: string) {
  return useQuery({
    queryKey: ["history-token", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<HistoryTokenResponse[]>>(
        `/history-token/project/${id}`,
      );
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
