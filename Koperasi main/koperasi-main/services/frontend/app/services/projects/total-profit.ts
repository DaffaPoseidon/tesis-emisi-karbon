import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

interface TotalProfitResponse {
  total: number | string;
}

export function useGetTotalProfit(id: string) {
  return useQuery({
    queryKey: ["total-profit", id],
    queryFn: async () => {
      const response = await httpClient.get<TotalProfitResponse>(`/project/total-profit/${id}`);
      return response.data;
    },
  });
}
