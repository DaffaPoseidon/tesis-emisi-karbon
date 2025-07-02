import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { CountResponse } from "~/types/constants/count-response";

export function useCountUsers() {
  return useQuery({
    queryKey: ["users", "count"],
    queryFn: async () => {
      const response = await httpClient.get<CountResponse>("/user/count");
      return response.data.data;
    },
  });
}
