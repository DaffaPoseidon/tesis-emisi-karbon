import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Proyek } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";

interface useGetAllProjectProps {
  page?: number;
  itemsPerPage?: number;
  filter?: string;
}

export function useGetAllPaginatedProject({
  page = 1,
  itemsPerPage = 10,
  filter,
}: useGetAllProjectProps) {
  return useQuery({
    queryKey: ["projects", page, itemsPerPage, filter],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Proyek[]>>("/project", {
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

export function useGetAllProject() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Proyek[]>>("/project");
      if (response.data.data === undefined) return [];
      return response.data.data;
    },
  });
}
