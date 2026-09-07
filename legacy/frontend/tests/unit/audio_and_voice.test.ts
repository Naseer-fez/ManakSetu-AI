import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { encodeWav, base64ToUint8Array } from '@/lib/audio.utils';
import { fetchQcoList, fetchKnowledgeGraph, getQcoForStandard } from '@/services/qco.service';
import { analyzeTender } from '@/services/tender.service';
import { fetchFastAnswer, summarizeContext, classifyImage } from '@/services/pipeline.service';

describe('Audio, QCO, Tender, and Pipeline Suite', () => {
  const originalFetch = global.fetch;

  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { global.fetch = originalFetch; });

  it('encodeWav outputs valid RIFF 16kHz mono WAV Blob', async () => {
    const samples = new Float32Array([0.0, 0.5, -0.5, 0.9, -0.9]);
    const blob = encodeWav(samples, 16000);
    expect(blob.type).toBe('audio/wav');
    expect(blob.size).toBe(44 + samples.length * 2);

    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(blob);
    });
    const view = new DataView(arrayBuffer);
    const text = (off: number, len: number) =>
      Array.from({ length: len }, (_, i) => String.fromCharCode(view.getUint8(off + i))).join('');

    expect(text(0, 4)).toBe('RIFF');
    expect(text(8, 4)).toBe('WAVE');
    expect(text(12, 4)).toBe('fmt ');
    expect(view.getUint16(20, true)).toBe(1); // PCM
    expect(view.getUint16(22, true)).toBe(1); // Mono
    expect(view.getUint32(24, true)).toBe(16000); // 16kHz
    expect(text(36, 4)).toBe('data');
  });

  it('base64ToUint8Array decodes base64 strings correctly', () => {
    const bytes = base64ToUint8Array('SGVsbG8=');
    expect(new TextDecoder().decode(bytes)).toBe('Hello');
  });

  it('qco and tender services perform valid HTTP requests', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/qco-list')) {
        return { ok: true, json: async () => ({ 'IS 1786': { is_mandatory: true, order_number: 'QCO-1' } }) };
      }
      if (url.includes('/graph')) {
        return { ok: true, json: async () => ({ nodes: [], edges: [] }) };
      }
      if (url.includes('/analyze-tender')) {
        return { ok: true, json: async () => ({ document_name: 'tender.pdf', items: [] }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    const qcoList = await fetchQcoList();
    expect(qcoList['IS 1786'].order_number).toBe('QCO-1');

    const singleQco = await getQcoForStandard('IS 1786');
    expect(singleQco?.is_mandatory).toBe(true);

    const graph = await fetchKnowledgeGraph(100);
    expect(graph.nodes).toEqual([]);

    const tender = await analyzeTender({ rawText: 'tender specs', useLlm: true });
    expect(tender.document_name).toBe('tender.pdf');
  });

  it('pipeline service handles multimodal and summary calls', async () => {
    global.fetch = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes('/fast-answer')) {
        return { ok: true, json: async () => ({ query: 'steel', answer: 'IS 1786', confidence_score: 0.95 }) };
      }
      if (url.includes('/summarize-context')) {
        return { ok: true, json: async () => ({ summarized_context: 'summary text' }) };
      }
      if (url.includes('/image/classify')) {
        return { ok: true, json: async () => ({ category: 'drawing', is_technical_drawing: true }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    const ans = await fetchFastAnswer('steel', 'doc text');
    expect(ans.answer).toBe('IS 1786');

    const sum = await summarizeContext([{ role: 'user', content: 'hello' }]);
    expect(sum.summarized_context).toBe('summary text');

    const mockFile = new File(['dummy'], 'drawing.png', { type: 'image/png' });
    const img = await classifyImage(mockFile);
    expect(img.is_technical_drawing).toBe(true);
  });
});
