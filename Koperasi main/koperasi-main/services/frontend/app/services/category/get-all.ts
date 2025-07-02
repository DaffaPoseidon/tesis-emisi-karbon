import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Kategori } from "~/types/api/kategori";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllCategory() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Kategori[]>>("/project-category");
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
