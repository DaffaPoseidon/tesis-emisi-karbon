import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useSendOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await httpClient.post("/user/send-otp", { id: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
