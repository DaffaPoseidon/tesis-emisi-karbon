import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { CountResponse } from "~/types/constants/count-response";

export function useCountProjects() {
  return useQuery({
    queryKey: ["projects", "count"],
    queryFn: async () => {
      const response = await httpClient.get<CountResponse>("/project/count");
      return response.data.data;
    },
  });
}
