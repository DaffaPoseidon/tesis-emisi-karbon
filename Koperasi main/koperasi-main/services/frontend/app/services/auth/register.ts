import { useMutation } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TRegisterRequest } from "~/types/api/auth";

export function useRegisterUser() {
  return useMutation({
    mutationFn: async (data: TRegisterRequest) => {
      const formData = new FormData();
      formData.append("nama", data.nama);
      formData.append("no_hp", data.no_hp);
      formData.append("password", data.password);
      formData.append("nik", data.nik);
      formData.append("tempat_lahir", data.tempat_lahir);
      formData.append("tanggal_lahir", data.tanggal_lahir);
      formData.append("provinsi", data.provinsi);
      formData.append("kota", data.kota);
      formData.append("kecamatan", data.kecamatan);
      formData.append("alamat", data.alamat);
      formData.append("role", "BASIC");
      for (const file of data.foto_diri || []) {
        formData.append("foto_diri", file);
      }
      for (const file of data.foto_ktp || []) {
        formData.append("foto_ktp", file);
      }
      await httpClient.post("/auth/register", formData);
    },
  });
}
