import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Anggota } from "~/types/api/anggota";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetUserById(id: string | undefined) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      if (id === undefined) return {} as Anggota;
      const response = await httpClient.get<BaseResponse<Anggota>>(`/user/${id}`);
      if (response.data.data === undefined) return {} as Anggota;
      return response.data.data;
    },
  });
}
