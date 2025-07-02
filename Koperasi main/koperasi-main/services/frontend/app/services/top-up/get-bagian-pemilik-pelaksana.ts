import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { PemilikPelaksanaResponse } from "~/types/api/pemilik-pelaksana";
import type { BaseResponse } from "~/types/constants/base-response";

interface GetAllPemilikPelaksanaProps {
  isDashboard?: boolean;
}

export function useGetPemilikPelaksana({ isDashboard = false }: GetAllPemilikPelaksanaProps) {
  return useQuery({
    queryKey: ["bagian-pemilik-pelaksana"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<PemilikPelaksanaResponse[]>>(
        "/topup/bagian-pemilik-pelaksana",
      );
      if (response.data.data === undefined) return [];
      if (isDashboard) {
        return response.data.data.slice(0, 10);
      }
      return response.data.data;
    },
  });
}
