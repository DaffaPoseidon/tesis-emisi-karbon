import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { LaporanResponse } from "~/types/api/laporan";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetReportById(id: string | number) {
  return useQuery({
    queryKey: ["project-report", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<LaporanResponse>>(`/project-report/${id}`);
      return response.data.data;
    },
  });
}
