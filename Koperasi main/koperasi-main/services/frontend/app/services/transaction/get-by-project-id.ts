import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TransactionResponse } from "~/types/api/transaction";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetTransactionByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["transaction", projectId],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<TransactionResponse[]>>(
        `/transaction/project/${projectId}`,
      );
      return response.data.data;
    },
  });
}
