import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { LaporanMutasiResponse } from "~/types/api/laporan";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetMutationByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["mutation", projectId],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<LaporanMutasiResponse>>(
        `/mutation/project/${projectId}`,
      );
      return response.data.data;
    },
  });
}
