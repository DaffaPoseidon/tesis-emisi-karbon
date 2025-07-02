import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useReviseProject(id: string) {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string) => {
      await httpClient.put(`/project/revise/${id}`, { keterangan: data });
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
