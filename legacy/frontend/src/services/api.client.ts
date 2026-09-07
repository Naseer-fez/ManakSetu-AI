/**
 * Base HTTP API client for BIS-SpecAI backend.
 * Uses configurable VITE_API_BASE_URL with graceful fallback to /api/v1.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getBaseApiUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
  if (!envUrl || envUrl.trim() === '') {
    return '/api/v1';
  }
  return envUrl.replace(/\/+$/, '');
}

export function buildEndpointUrl(endpoint: string): string {
  const base = getBaseApiUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export async function requestJson<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = buildEndpointUrl(endpoint);
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const detail = (errorBody as { detail?: string } | null)?.detail;
    throw new ApiError(res.status, detail || res.statusText || 'API request failed', errorBody);
  }
  return res.json() as Promise<T>;
}

export async function requestBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<Blob> {
  const url = buildEndpointUrl(endpoint);
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, errorText || 'Blob request failed');
  }
  return res.blob();
}

export async function postFormData<T>(
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  return requestJson<T>(endpoint, {
    ...options,
    method: 'POST',
    body: formData,
  });
}
