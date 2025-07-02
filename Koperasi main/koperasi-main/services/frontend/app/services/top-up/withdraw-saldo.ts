import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TVerifyPayment } from "~/types/api/verify-payment";

export function useWithdrawSaldo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: TVerifyPayment) => {
      await httpClient.post("/topup/withdraw", {
        nama_bank: data.nama_bank,
        no_rekening: data.no_rekening,
        nama_pemilik_rekening: data.nama_pemilik_rekening,
        nominal: data.nominal,
      });
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
