import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";

export function useAccUpgradeMember() {
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  return useMutation({
    mutationFn: async ({ id }: { id?: string | number }) => {
      await httpClient.post("/user/acc-upgrade-platinum", { id: id });
    },
    onSuccess: () => {
      revalidator.revalidate();
      queryClient.invalidateQueries();
    },
  });
}
