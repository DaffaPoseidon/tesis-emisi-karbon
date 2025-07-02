import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TLaporan } from "~/types/api/laporan";

export function useStoreReport() {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: TLaporan) => {
      await httpClient.post("/project-report", {
        id_projek: data.id ?? "",
        judul: data.judul,
        jenis_laporan: data.jenis_laporan,
        nominal: data.nominal.toString(),
        modal: data.modal.toString(),
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
        queryKey: ["project-report"],
      });
    },
  });
}
