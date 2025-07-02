import type { QueryClientConfig } from "@tanstack/react-query";

const MAX_RETRY = 2;

export const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // With SSR, we usually want to set some default staleTime
      // above 0 to avoid refetching immediately on the client
      staleTime: 60 * 1000,
      retry: MAX_RETRY,
    },
  },
};
