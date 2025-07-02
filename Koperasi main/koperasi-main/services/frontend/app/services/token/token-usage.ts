import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Proyek } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllTokenUsage() {
  return useQuery({
    queryKey: ["token-usage"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Proyek[]>>("/token/usage-details");
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
