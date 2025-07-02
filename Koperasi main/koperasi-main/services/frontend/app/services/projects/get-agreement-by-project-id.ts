import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { AgreementProjectResponse } from "~/types/api/agreement";
import type { BaseResponse } from "~/types/constants/base-response";

export function useGetAgreementProject(projectId: string) {
  return useQuery({
    queryKey: ["agreement-project", projectId],
    queryFn: async () => {
      const response = await httpClient.get<BaseResponse<AgreementProjectResponse[]>>(
        `/project/${projectId}/agreement-letter`,
      );
      return response.data.data ? response.data.data[0] : undefined;
    },
  });
}
