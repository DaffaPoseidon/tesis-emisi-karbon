import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { BaseResponse } from "~/types/constants/base-response";

interface ITotalToken {
  data: string;
}

export function useGetTotalTokenRupiah() {
  return useQuery({
    queryKey: ["total-token"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<ITotalToken>>("/topup/kas-koperasi");
      return response.data.data;
    },
  });
}
