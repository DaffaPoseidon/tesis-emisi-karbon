import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TokenResponse } from "~/types/api/proyek";

interface TokenApiResponse {
  data: TokenResponse[];
}

interface ProjectTokenData {
  jumlah_token: number;
  data: TokenResponse[];
}

export const useGetProjectToken = (projectId: string | undefined) => {
  return useQuery<ProjectTokenData>({
    queryKey: ["project-token", projectId],
    queryFn: async () => {
      if (!projectId) {
        return {
          jumlah_token: 0,
          data: [],
        };
      }

      try {
        const { data } = await httpClient.get<TokenApiResponse>(`/project/${projectId}/user`);
        const totalToken =
          data.data?.reduce((total, item) => total + Number(item.jumlah_token), 0) || 0;

        return {
          jumlah_token: totalToken,
          data: data.data || [],
        };
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      } catch (error: any) {
        // Handle 404 or other errors by returning default values
        if (error.response?.status === 404) {
          return {
            jumlah_token: 0,
            data: [],
          };
        }
        throw error;
      }
    },
    enabled: !!projectId,
  });
};
