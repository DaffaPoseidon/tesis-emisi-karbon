import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { ProyekPendanaan } from "~/types/api/proyek-pendanaan";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetProjectWalletByWalletId(id: string) {
  return useQuery({
    queryKey: ["project-wallet", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<ProyekPendanaan[]>>(
        `/project-wallet/project/${id}`,
      );
      if (response.data.data === undefined) return {} as ProyekPendanaan;
      return response.data.data[0];
    },
  });
}
