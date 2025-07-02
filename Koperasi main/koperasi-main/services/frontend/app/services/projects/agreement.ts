import { useRevalidator } from "@remix-run/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { z } from "zod";
import { httpClient } from "~/lib/http";
import type { signContractSchema } from "~/routes/app.my-projects.$id._index/components/modal/sign-contract";

export function useAgreementProject() {
  const revalidator = useRevalidator();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof signContractSchema>) => {
      const formData = new FormData();
      if (data.id) {
        formData.append("id_projek", data.id);
      }
      formData.append("tanda_tangan", data.contract as File);
      await httpClient.post("/project/agreement-letter", formData);
    },
    onSuccess: () => {
      revalidator.revalidate();
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({
        queryKey: ["history-project"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-projects"],
      });
    },
  });
}
