import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { AccWithdraw } from "~/types/api/top-up";

export function useUpdateWithdrawal(id: string) {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async (data: AccWithdraw) => {
      const formData = new FormData();
      formData.append("id", id);
      if (data.bukti_pembayaran) {
        for (const file of data.bukti_pembayaran) {
          formData.append("bukti_pembayaran", file);
        }
      }
      await httpClient.post("/topup/acc-withdraw", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      queryClient.invalidateQueries({
        queryKey: ["acc-withdraw"],
      });
      revalidator.revalidate();
    },
  });
}
