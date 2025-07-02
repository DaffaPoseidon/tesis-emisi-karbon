import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Publish } from "~/types/api/proyek";

export function usePublishProject(id: string) {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: Publish) => {
      const formData = new FormData();
      formData.append("id_projek", data.id_proyek?.toString() ?? "");
      formData.append("mulai_penggalangan_dana", data.mulai_penggalangan_dana);
      formData.append("selesai_penggalangan_dana", data.selesai_penggalangan_dana);
      formData.append("dokumen_prospektus", data.dokumen_prospektus ?? "");
      await httpClient.put("/project/publish", formData);
    },
    onSuccess: () => {
      revalidator.revalidate();
      queryClient.invalidateQueries({
        queryKey: ["project", id],
      });
      queryClient.invalidateQueries({
        queryKey: ["history-project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-projects"],
      });
    },
  });
}
