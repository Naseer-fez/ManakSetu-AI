import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { streamSSE } from '@/services/sse.client';
import { fetchRecommendations, getStandardByCode } from '@/services/standards.service';
import { analyzeWorkspace, exportWorkspace } from '@/services/workspace.service';
import { validateGemBid } from '@/services/gem.service';
import { fetchVoiceStatus } from '@/services/voice.service';
import { ApiError } from '@/services/api.client';

function mockSseResponse(body: string) {
  let read = false;
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: vi.fn().mockImplementation(async () => {
          if (!read) { read = true; return { done: false, value: new TextEncoder().encode(body) }; }
          return { done: true, value: undefined };
        }),
        releaseLock: vi.fn(),
      }),
    },
  };
}

describe('SSE and Services Unit Suite', () => {
  const originalFetch = global.fetch;
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { global.fetch = originalFetch; });

  it('streamSSE parses JSON chunks, [DONE], and completes', async () => {
    const sseBody = 'data: {"text": "Hello "}\n\ndata: {"text": "world!"}\n\ndata: [DONE]\n\n';
    global.fetch = vi.fn().mockResolvedValue(mockSseResponse(sseBody));
    const chunks: string[] = [];
    let completed = false;
    await streamSSE('/test-sse', {
      onChunk: (c: string) => chunks.push(c),
      onComplete: () => { completed = true; },
    });
    expect(chunks).toEqual(['Hello ', 'world!']);
    expect(completed).toBe(true);
  });

  it('streamSSE handles [ERROR:...], error JSON, and HTTP failures', async () => {
    let capturedErr: Error | null = null;
    global.fetch = vi.fn().mockResolvedValue(mockSseResponse('data: [ERROR: Server rate limit exceeded]\n\n'));
    await streamSSE('/test-err', { onChunk: () => {}, onError: (err: Error) => { capturedErr = err; } });
    expect(capturedErr?.message).toContain('Server rate limit exceeded');

    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 503, text: async () => 'Unavailable' });
    await expect(streamSSE('/fail', { onChunk: () => {} })).rejects.toThrow(ApiError);
  });

  it('REST services construct correct URLs and payloads', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/recommend')) return { ok: true, json: async () => ({ query: 'pipes' }) };
      if (url.includes('/standards/IS%201786')) return { ok: true, json: async () => ({ is_code: 'IS 1786' }) };
      if (url.includes('/workspaces/ws-1/analyze')) return { ok: true, json: async () => ({ report: {} }) };
      if (url.includes('/workspaces/ws-1/export')) return { ok: true, blob: async () => new Blob(['pdf']) };
      if (url.includes('/gem-webhook')) return { ok: true, json: async () => ({ status: 'VALID' }) };
      if (url.includes('/voice/status')) return { ok: true, json: async () => ({ stt_available: true }) };
      return { ok: true, json: async () => ({}) };
    });

    const rec = await fetchRecommendations({ query: 'pipes' });
    expect(rec.query).toBe('pipes');
    const std = await getStandardByCode('IS 1786');
    expect(std.is_code).toBe('IS 1786');
    const audit = await analyzeWorkspace('ws-1', undefined, 'Raw text');
    expect(audit).toHaveProperty('report');
    const blob = await exportWorkspace('ws-1', { format: 'pdf', template: {} as any, values: {} });
    expect(blob.size).toBeGreaterThan(0);
    const gem = await validateGemBid({ bid_id: 'B1', category_name: 'C', product_title: 'P', buyer_specifications: 'S' });
    expect(gem.status).toBe('VALID');
    const voice = await fetchVoiceStatus();
    expect(voice.stt_available).toBe(true);
  });
});
