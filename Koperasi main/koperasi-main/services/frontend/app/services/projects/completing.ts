import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useComplateProject(id: string) {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await httpClient.put("project/complete", { id });
    },
    onSuccess: () => {
      revalidator.revalidate();
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["history-project"],
      });
    },
  });
}
