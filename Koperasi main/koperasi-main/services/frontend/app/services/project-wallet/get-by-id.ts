import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { HistoryPendanaan } from "~/types/api/proyek-pendanaan";
import type { BaseResponse } from "~/types/constants/base-response";

interface GetHistoryProjectProps {
  id: string | number;
  isDashboard?: boolean;
}

export function useGethistoryProjectById({ id, isDashboard = false }: GetHistoryProjectProps) {
  return useQuery({
    queryKey: ["history-project-wallet", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<HistoryPendanaan[]>>(
        `/history-project-wallet/project-wallet/${id}`,
      );
      if (response.data.data === undefined) return [];
      if (isDashboard) {
        return response.data.data.slice(0, 10);
      }
      return response.data.data;
    },
  });
}
