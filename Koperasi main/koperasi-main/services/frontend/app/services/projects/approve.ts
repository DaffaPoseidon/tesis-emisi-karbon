import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Approve } from "~/types/api/proyek";

export function useApproveProject(id: string) {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Approve) => {
      await httpClient.put(`/project/approve/${id}`, {
        nominal_disetujui: data.nominal_disetujui,
        harga_per_unit: data.harga_per_unit,
        jumlah_koin: data.jumlah_koin,
        minimal_pembelian: data.minimal_pembelian,
        maksimal_pembelian: data.maksimal_pembelian,
        report_progress: data.report_progress,
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
