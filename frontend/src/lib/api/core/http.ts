const serverApiBaseUrl = process.env.PROCESS_INTELLIGENCE_API_BASE_URL || "http://127.0.0.1:8765";

function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (typeof window === "undefined") return `${serverApiBaseUrl}${path}`;
  return path;
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return parseResponse<T>(await fetch(resolveApiUrl(path), { cache: "no-store" }));
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return parseResponse<T>(
    await fetch(resolveApiUrl(path), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return parseResponse<T>(await fetch(resolveApiUrl(path), { method: "POST", body: form }));
}
