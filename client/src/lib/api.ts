export async function apiRequest<T = any>(
  method: string,
  url: string,
  body?: any
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // ignore if response is not JSON
    }
    throw new Error(message);
  }

  // if server returns no content (204), skip parsing
  if (response.status === 204) {
    return {} as T;
  }

  return response.json() as Promise<T>;
}
