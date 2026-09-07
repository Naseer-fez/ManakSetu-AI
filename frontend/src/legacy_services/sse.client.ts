/**
 * Resilient Server-Sent Events (SSE) streaming client.
 * Parses data: lines, JSON chunks, [DONE] sentinels, and [ERROR:...] payloads.
 */
import { buildEndpointUrl, ApiError } from './api.client';

export interface SseOptions {
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  onChunk: (text: string) => void;
  onError?: (err: Error) => void;
  onComplete?: () => void;
}

function processPayload(payload: string, options: SseOptions): boolean {
  if (payload === '[DONE]') {
    options.onComplete?.();
    return true;
  }
  if (payload.startsWith('[ERROR:')) {
    const msg = payload.replace(/^\[ERROR:\s*/, '').replace(/\]$/, '');
    const err = new Error(msg || 'SSE stream error');
    if (options.onError) options.onError(err);
    else throw err;
    return true;
  }
  try {
    const parsed = JSON.parse(payload);
    if (parsed.done === true) {
      options.onComplete?.();
      return true;
    }
    if (parsed.error) {
      const err = new Error(String(parsed.error));
      if (options.onError) options.onError(err);
      else throw err;
      return true;
    }
    if (typeof parsed.text === 'string') {
      options.onChunk(parsed.text);
      return false;
    }
  } catch {
    // Non-JSON payload; treat as plain text chunk
  }
  options.onChunk(payload);
  return false;
}

export async function streamSSE(url: string, options: SseOptions): Promise<void> {
  const fullUrl = buildEndpointUrl(url);
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => res.statusText);
    throw new ApiError(res.status, `SSE stream failed: ${errorText}`);
  }
  if (!res.body) throw new ApiError(500, 'SSE response body is null');

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (value) buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = done ? '' : (events.pop() ?? '');

      for (const event of events) {
        if (!event.trim()) continue;
        for (const line of event.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue;
          const payload = line.replace(/^data:\s?/, '').trim();
          if (processPayload(payload, options)) return;
        }
      }
      if (done) {
        options.onComplete?.();
        break;
      }
    }
  } finally {
    reader.releaseLock();
  }
}
