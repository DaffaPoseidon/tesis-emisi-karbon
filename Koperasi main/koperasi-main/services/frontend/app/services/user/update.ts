import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { Anggota } from "~/types/api/anggota";

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Anggota) => {
      const formData = new FormData();
      formData.append("nama", data.nama);
      formData.append("nik", data.nik);
      formData.append("no_hp", data.no_hp);
      formData.append("tempat_lahir", data.tempat_lahir);
      formData.append("tanggal_lahir", data.tanggal_lahir);
      formData.append("provinsi", data.provinsi ?? "");
      formData.append("kota", data.kota ?? "");
      formData.append("kecamatan", data.kecamatan ?? "");
      formData.append("alamat", data.alamat ?? "");
      formData.append("foto_profile", data.foto_profile ?? "");
      for (const file of data.signature || []) {
        formData.append("signature", file);
      }
      for (const file of data.foto_diri || []) {
        formData.append("foto_diri", file);
      }
      formData.append("foto_ktp", data.foto_ktp ?? "");
      await httpClient.put(`/user/${id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", id],
      });
    },
  });
}
