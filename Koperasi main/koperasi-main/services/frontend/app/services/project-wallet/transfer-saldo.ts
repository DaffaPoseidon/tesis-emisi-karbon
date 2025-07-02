import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { TVerifyPayment } from "~/types/api/verify-payment";

export function useTransferSaldo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      data: Pick<TVerifyPayment, "id_proyek" | "deskripsi" | "nominal" | "bukti_transfer">,
    ) => {
      const formData = new FormData();
      formData.append("id_projek", data.id_proyek ?? "");
      formData.append("deskripsi", data.deskripsi ?? "");
      formData.append("nominal", data.nominal?.toString() ?? "");
      if (data.bukti_transfer) {
        for (const file of data.bukti_transfer) {
          formData.append("bukti_transfer", file);
        }
      }
      await httpClient.post("/project-wallet/transfer-saldo", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["transfer-saldo"],
      });
    },
  });
}
