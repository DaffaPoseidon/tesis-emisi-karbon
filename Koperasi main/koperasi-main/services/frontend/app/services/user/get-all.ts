import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Anggota } from "~/types/api/anggota";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllUser() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Anggota[]>>("/user");
      if (response.data.data === undefined) return;
      return response.data.data;
    },
  });
}
