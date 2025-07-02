import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { PayBagianPemilikPelaksana } from "~/types/api/top-up";

export function usePayBagianPemilikPelaksana(id: string) {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: PayBagianPemilikPelaksana) => {
      const formData = new FormData();
      formData.append("id", id);
      formData.append("no_rekening", data.no_rekening);
      formData.append("nama_pemilik_rekening", data.nama_pemilik_rekening);
      formData.append("nama_bank", data.nama_bank);
      if (data.bukti_pembayaran) {
        for (const file of data.bukti_pembayaran) {
          formData.append("bukti_pembayaran", file);
        }
      }
      await httpClient.post("/topup/pay-bagian-pemilik-pelaksana", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: ["pay-bagian-pemilik-pelaksana"],
      });
      revalidator.revalidate();
    },
  });
}
