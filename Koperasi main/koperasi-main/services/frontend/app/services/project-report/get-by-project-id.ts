import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { LaporanByProjectResponse } from "~/types/api/laporan";
import type { BaseResponse } from "~/types/constants/base-response";

interface GetReportByProjectIdProps {
  id: string | number;
  jenis_laporan?: string;
}
export function useGetReportByProjectId({ id, jenis_laporan = "" }: GetReportByProjectIdProps) {
  return useQuery({
    queryKey: ["project-report", id, jenis_laporan],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<LaporanByProjectResponse>>(
        `/project-report/project/${id}?jenis_laporan=${jenis_laporan}`,
      );
      return response.data.data;
    },
  });
}
