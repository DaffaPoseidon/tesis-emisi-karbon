import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useRejectProject(id: string) {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: string) => {
      const formData = new FormData();
      formData.append("keterangan", data);
      await httpClient.put(`/project/reject/${id}`, formData);
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
