import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { ProyekPendanaan } from "~/types/api/proyek-pendanaan";
import type { BaseResponse } from "~/types/constants/base-response";

interface useGetAllProjectWalletProps {
  page?: number;
  itemsPerPage?: number;
  filter?: string;
}

export function useGetAllPaginatedProjectWallet({
  page = 1,
  itemsPerPage = 10,
  filter,
}: useGetAllProjectWalletProps) {
  return useQuery({
    queryKey: ["projects-wallet", page, itemsPerPage, filter],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<ProyekPendanaan[]>>("/project-wallet", {
        params: {
          status: filter,
        },
      });
      if (response.data.data === undefined) return { projects: [], total: 0 };

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProjects = response.data.data.slice(startIndex, endIndex);

      return {
        projects: paginatedProjects,
        total: response.data.data.length,
      };
    },
  });
}

export function useGetAllProjectWallet() {
  return useQuery({
    queryKey: ["projects-wallet"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<ProyekPendanaan[]>>("/project-wallet");
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
