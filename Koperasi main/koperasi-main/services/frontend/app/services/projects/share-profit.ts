import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useShareProfit() {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (id: string | undefined) => {
      await httpClient.put("/project/share-profit", {
        id: id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["top-up"],
      });
      revalidator.revalidate();
    },
  });
}
