const DB_NAME = "bis_specai_storage";
const STORE_NAME = "pdfs";
const META_PREFIX = "bis_pdf_meta_";

export interface StoredPdfMetadata {
  key: string;
  name: string;
  size: number;
  updatedAt: number;
}

const activeBlobUrls = new Map<string, string>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      return reject(new Error("IndexedDB is not available"));
    }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error("Failed to open IndexedDB"));
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
  const fileName = name || (file instanceof File ? file.name : "document.pdf");
  const metadata: StoredPdfMetadata = {
    key,
    name: fileName,
    size: file.size,
    updatedAt: Date.now(),
  };

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({ ...metadata, blob: file });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.setItem(`${META_PREFIX}${key}`, JSON.stringify(metadata));
  } catch (err) {
    console.warn(`[pdfStorage] IndexedDB save fallback for ${key}:`, err);
  }

  const existingUrl = activeBlobUrls.get(key);
  if (existingUrl) URL.revokeObjectURL(existingUrl);

  const newUrl = URL.createObjectURL(file);
  activeBlobUrls.set(key, newUrl);
  return newUrl;
}

export async function getPdfBlob(key: string): Promise<Blob | null> {
  try {
    const db = await openDatabase();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(key);
      req.onsuccess = () => resolve(req.result ? req.result.blob : null);
      req.onerror = () => reject(req.error);
    });
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
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore cleanup errors
  }
}

