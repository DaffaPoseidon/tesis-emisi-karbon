import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TransactionResponse } from "~/types/api/transaction";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllTransaction() {
  return useQuery({
    queryKey: ["transaction"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<TransactionResponse[]>>("/transaction");
      return response.data.data;
    },
  });
}
