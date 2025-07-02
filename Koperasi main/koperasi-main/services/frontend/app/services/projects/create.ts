import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Proyek } from "~/types/api/proyek";

export function useStoreProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Proyek) => {
      const formData = new FormData();
      formData.append("id_kategori", data.kategori?.id?.toString() ?? "");
      formData.append("judul", data.judul);
      formData.append("deskripsi", data.deskripsi);
      formData.append("nominal", data.nominal.toString());
      formData.append("asset_jaminan", data.asset_jaminan);
      formData.append("nilai_jaminan", data.nilai_jaminan);
      formData.append("lokasi_usaha", data.lokasi_usaha);
      formData.append("detail_lokasi", data.detail_lokasi);
      for (const file of data.brosur_produk || []) {
        formData.append("brosur_produk", file);
      }
      formData.append("pendapatan_perbulan", data.pendapatan_perbulan);
      formData.append("pengeluaran_perbulan", data.pengeluaran_perbulan);
      for (const file of data.dokumen_proyeksi || []) {
        formData.append("dokumen_proyeksi", file);
      }
      for (const file of data.dokumen || []) {
        formData.append("dokumen", file);
      }
      formData.append("limit_siklus", data.limit_siklus?.toString() ?? "");
      formData.append("bagian_pelaksana", data.bagian_pelaksana?.toString() ?? "");
      formData.append("bagian_koperasi", data.bagian_koperasi?.toString() ?? "");
      formData.append("bagian_pemilik", data.bagian_pemilik?.toString() ?? "");
      formData.append("bagian_pendana", data.bagian_pendana?.toString() ?? "");
      await httpClient.post("/project", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-projects"],
      });
    },
  });
}
