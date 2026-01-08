import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 180000, // 3 min
      cacheTime: 180000,
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});
