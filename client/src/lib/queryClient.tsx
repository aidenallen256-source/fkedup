import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

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
