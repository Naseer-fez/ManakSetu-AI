import { putPdfRecord, getPdfRecord, deletePdfRecord, type StoredPdfRecord } from "@/lib/pdfIndexedDb.utils";

const META_PREFIX = "bis_pdf_meta_";

export interface StoredPdfMetadata {
  key: string;
  name: string;
  size: number;
  updatedAt: number;
}

const activeBlobUrls = new Map<string, string>();

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
    const record: StoredPdfRecord = { ...metadata, blob: file };
    await putPdfRecord(record);
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
    const record = await getPdfRecord(key);
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
    await deletePdfRecord(key);
  } catch {
    // Ignore cleanup errors
  }
}

