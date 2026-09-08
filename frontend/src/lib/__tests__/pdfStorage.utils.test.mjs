import test from "node:test";
import assert from "node:assert";

// Mock browser globals for Node test environment
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => mockStorage.get(k) || null,
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
};

let urlCounter = 0;
const createdUrls = new Set();
globalThis.URL.createObjectURL = (blob) => {
  const url = `blob:http://localhost:5173/test-${++urlCounter}`;
  createdUrls.add(url);
  return url;
};
globalThis.URL.revokeObjectURL = (url) => {
  createdUrls.delete(url);
};

// Now import after polyfills
const {
  savePdfLocally,
  getCachedBlobUrl,
  getPdfMetadata,
  clearPdfLocally,
} = await import("../pdfStorage.utils.ts");

test("savePdfLocally registers blob URL and sets metadata", async () => {
  const testBlob = new Blob(["%PDF-1.4 sample binary"], { type: "application/pdf" });
  const key = "tender_test_key";
  const url = await savePdfLocally(key, testBlob, "sample_tender.pdf");

  assert.ok(url.startsWith("blob:"));
  assert.strictEqual(getCachedBlobUrl(key), url);

  const meta = getPdfMetadata(key);
  assert.ok(meta);
  assert.strictEqual(meta.name, "sample_tender.pdf");
  assert.strictEqual(meta.size, testBlob.size);
  assert.ok(typeof meta.updatedAt === "number");
});

test("clearPdfLocally revokes url and removes metadata", async () => {
  const testBlob = new Blob(["%PDF-1.4 sample"], { type: "application/pdf" });
  const key = "clear_test_key";
  const url = await savePdfLocally(key, testBlob, "to_clear.pdf");

  assert.strictEqual(getCachedBlobUrl(key), url);
  assert.ok(getPdfMetadata(key));

  await clearPdfLocally(key);
  assert.strictEqual(getCachedBlobUrl(key), null);
  assert.strictEqual(getPdfMetadata(key), null);
});
