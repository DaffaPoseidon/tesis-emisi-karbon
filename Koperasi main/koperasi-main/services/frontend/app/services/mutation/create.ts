import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TLaporanMutasi } from "~/types/api/laporan";

export function useStoreMutation(id: string | number) {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: TLaporanMutasi) => {
      const formData = new FormData();
      formData.append("id_projek", id.toString());
      formData.append("judul", data.title);
      formData.append("pemasukan", data.amount_profit.toString());
      formData.append("pengeluaran", data.amount_loss.toString());
      for (const file of data.document) {
        formData.append("laporan", file);
      }
      await httpClient.post("mutation", formData);
    },
    onSuccess: () => {
      revalidator.revalidate();
      queryClient.invalidateQueries({
        queryKey: ["mutation"],
      });
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
