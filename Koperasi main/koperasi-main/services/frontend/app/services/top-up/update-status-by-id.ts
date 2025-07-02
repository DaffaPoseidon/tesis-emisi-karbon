import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useUpdateTopUpById() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      await httpClient.post("/topup/acc-topup", { id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["top-up"],
      });
    },
  });
}
