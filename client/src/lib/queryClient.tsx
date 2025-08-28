import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = typeof queryKey[0] === "string" ? queryKey[0] : String(queryKey[0]);
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
        return res.json();
      },
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Simple wrapper for fetch requests with error handling.
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}
