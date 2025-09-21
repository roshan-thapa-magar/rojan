// lib/fetcher.ts
export async function apiFetch<T = unknown>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);
  const text = await res.text();

  // try parse json, fallback to null
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      (data && (data.error || data.message)) ||
      res.statusText ||
      "Request failed";
    throw new Error(msg);
  }

  return data as T;
}
