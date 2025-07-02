import { useQuery } from "@tanstack/react-query";
import { httpClient } from "~/lib/http";
import type { WhatsappQrCodeResponse } from "~/types/api/whatsapp-qr-code";

export function useGetQrCode() {
  return useQuery({
    queryKey: ["qr-code"],
    queryFn: async () => {
      const response = await httpClient.get<WhatsappQrCodeResponse>("/whatsapp/qr-code");
      if (response.data === undefined) return;
      return response.data;
    },
  });
}
