import type { Book, DocumentAsset } from '../types';
import { IndexedDbDocumentAssetStore, type DocumentAssetStoreBackend } from './documentAssetStore';

const localStore = new IndexedDbDocumentAssetStore();
export const MAX_DOCUMENT_ASSET_BYTES = 20 * 1024 * 1024;
export const DOCUMENT_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);

function validId(id: string): boolean { return /^[a-zA-Z0-9_-]{1,128}$/.test(id); }
export function documentAssetPath(prefix: string, bookId: string, assetId: string): string {
  if (!validId(bookId) || !validId(assetId) || !(prefix === 'catalog' || /^users\/[a-zA-Z0-9_-]{1,128}\/customBooks$/.test(prefix))) {
    throw new Error('ID/path aset dokumen tidak valid.');
  }
  return `${prefix}/${bookId}/assets/${assetId}`;
}

export async function resolveAssetBlob(
  bookId: string, asset: DocumentAsset, download: (path: string) => Promise<Blob>,
  store: DocumentAssetStoreBackend = localStore,
): Promise<Blob | null> {
  const cached = await store.getAsset(bookId, asset.id);
  if (cached) return cached.blob;
  if (!asset.storagePath) return null;
  const blob = await download(asset.storagePath);
  await store.saveAsset(bookId, asset, blob);
  return blob;
}

export async function syncBookAssets(
  book: Book, prefix: string,
  cloud: { upload: (path: string, blob: Blob) => Promise<void>; download: (path: string) => Promise<Blob> },
  store: DocumentAssetStoreBackend = localStore,
): Promise<Book> {
  const assets: DocumentAsset[] = [];
  // Sequential uploads bound memory and request concurrency for illustrated books.
  for (const asset of book.assets || []) {
    const storagePath = documentAssetPath(prefix, book.id, asset.id);
    const blob = await resolveAssetBlob(book.id, asset, cloud.download, store);
    if (!blob) throw new Error(`Gambar ${asset.id} tidak tersedia untuk sinkronisasi.`);
    if (!DOCUMENT_IMAGE_TYPES.has(asset.mediaType) || blob.size > MAX_DOCUMENT_ASSET_BYTES) {
      throw new Error(`Gambar ${asset.id} harus PNG/JPEG/WebP/GIF dan maksimal 20 MB.`);
    }
    await cloud.upload(storagePath, blob);
    const metadata = { ...asset };
    delete metadata.sourceUrl;
    assets.push({ ...metadata, storagePath, byteSize: blob.size });
  }
  return book.assets ? { ...book, assets } : book;
}
