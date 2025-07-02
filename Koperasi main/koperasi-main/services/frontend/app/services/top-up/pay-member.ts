import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TVerifyPayment } from "~/types/api/verify-payment";

export function usePayMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TVerifyPayment) => {
      const formData = new FormData();
      formData.append("no_rekening", data.no_rekening);
      formData.append("nama_pemilik_rekening", data.nama_pemilik_rekening);
      formData.append("nama_bank", data.nama_bank);
      if (data.bukti_pembayaran) {
        for (const file of data.bukti_pembayaran) {
          formData.append("bukti_pembayaran", file);
        }
      }
      await httpClient.post("/topup/pay-member", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
      queryClient.invalidateQueries({
        queryKey: ["saldo"],
      });
      queryClient.invalidateQueries({
        queryKey: ["top-up"],
      });
    },
  });
}
