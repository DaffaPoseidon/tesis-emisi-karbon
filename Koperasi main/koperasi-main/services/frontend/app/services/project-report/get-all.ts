import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { LaporanResponse } from "~/types/api/laporan";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllReport() {
  return useQuery({
    queryKey: ["project-report"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<LaporanResponse[]>>("/project-report");
      return response.data.data;
    },
  });
}
