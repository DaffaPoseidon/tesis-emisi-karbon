import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TProyekBeli } from "~/types/api/proyek-beli";

export function useBuyProject(id: string) {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: TProyekBeli) => {
      await httpClient.post("/token/buy-token", {
        id_projek: id,
        jumlah_token: data.nominal,
      });
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
