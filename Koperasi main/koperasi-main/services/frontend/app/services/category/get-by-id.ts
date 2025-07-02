import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Kategori } from "~/types/api/kategori";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetCategory(id: string) {
  return useQuery({
    queryKey: ["category", id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Kategori>>(`/project-category/${id}`);
      return response.data.data;
    },
  });
}
