import { useQuery } from "@tanstack/react-query";
import { useJWTPayload } from "~/hooks/use-jwt-payload";
import { httpClient } from "~/lib/http";
import type { Proyek } from "~/types/api/proyek";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAllMyProjects(page: number, itemsPerPage: number) {
  const { jwtPayload } = useJWTPayload();
  return useQuery({
    queryKey: ["my-projects", page, itemsPerPage, jwtPayload.id],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<Proyek[]>>("/project/user");
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
