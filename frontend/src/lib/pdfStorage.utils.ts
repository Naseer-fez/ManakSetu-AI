const DB_NAME = "bis_specai_storage";
const STORE = "pdfs";
const META_PREFIX = "bis_pdf_meta_";

export interface StoredPdfMetadata {
  key: string;
  name: string;
  size: number;
  updatedAt: number;
}

interface StoredPdfRecord extends StoredPdfMetadata {
  blob: Blob;
}

const activeBlobUrls = new Map<string, string>();

async function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest): Promise<T | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "key" });
    req.onsuccess = () => {
      const tx = req.result.transaction(STORE, mode);
      const r = fn(tx.objectStore(STORE));
      r.onsuccess = () => resolve(r.result ?? null);
      r.onerror = () => reject(r.error);
    };
    req.onerror = () => reject(req.error);
  });
}

export function getCachedBlobUrl(key: string): string | null {
  return activeBlobUrls.get(key) || null;
}

export function getPdfMetadata(key: string): StoredPdfMetadata | null {
  try {
    const raw = localStorage.getItem(`${META_PREFIX}${key}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function savePdfLocally(key: string, file: File | Blob, name?: string): Promise<string> {
  const metadata: StoredPdfMetadata = {
    key,
    name: name || (file instanceof File ? file.name : "document.pdf"),
    size: file.size,
    updatedAt: Date.now(),
  };

  try {
    await withStore("readwrite", (store) => store.put({ ...metadata, blob: file }));
    localStorage.setItem(`${META_PREFIX}${key}`, JSON.stringify(metadata));
  } catch (err) {
    console.warn(`[pdfStorage] IndexedDB fallback for ${key}:`, err);
  }

  const existingUrl = activeBlobUrls.get(key);
  if (existingUrl) URL.revokeObjectURL(existingUrl);

  const newUrl = URL.createObjectURL(file);
  activeBlobUrls.set(key, newUrl);
  return newUrl;
}

export async function getPdfBlob(key: string): Promise<Blob | null> {
  try {
    const record = await withStore<StoredPdfRecord>("readonly", (store) => store.get(key));
    return record ? record.blob : null;
  } catch {
    return null;
  }
}

export async function getPdfBlobUrl(key: string): Promise<string | null> {
  const cached = activeBlobUrls.get(key);
  if (cached) return cached;
  const blob = await getPdfBlob(key);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  activeBlobUrls.set(key, url);
  return url;
}

export async function clearPdfLocally(key: string): Promise<void> {
  const existingUrl = activeBlobUrls.get(key);
  if (existingUrl) {
    URL.revokeObjectURL(existingUrl);
    activeBlobUrls.delete(key);
  }
  try {
    localStorage.removeItem(`${META_PREFIX}${key}`);
    await withStore("readwrite", (store) => store.delete(key));
  } catch {
    // Ignore cleanup errors
  }
}
