import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TransactionResponse } from "~/types/api/transaction";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetTransactionByUserId(UserId: string) {
  return useQuery({
    queryKey: ["transaction", UserId],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<TransactionResponse[]>>(
        `/transaction/user/${UserId}`,
      );
      return response.data.data;
    },
  });
}
