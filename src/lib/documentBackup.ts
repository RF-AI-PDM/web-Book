import type { Book } from '../types';
import { IndexedDbDocumentAssetStore, type DocumentAssetStoreBackend } from './documentAssetStore';

export interface BackupAsset {
  bookId: string;
  assetId: string;
  mediaType: string;
  base64: string;
}
const store = new IndexedDbDocumentAssetStore();
const MAX_ASSET_BYTES = 20 * 1024 * 1024;

export async function exportBookAssets(books: Book[], backend: DocumentAssetStoreBackend = store): Promise<BackupAsset[]> {
  const assets: BackupAsset[] = [];
  for (const book of books) for (const asset of book.assets || []) {
    let stored = await backend.getAsset(book.id, asset.id);
    if (!stored && asset.storagePath) {
      const { downloadDocumentAsset } = await import('./firebaseStorage');
      const blob = await downloadDocumentAsset(asset.storagePath);
      stored = await backend.saveAsset(book.id, asset, blob);
    }
    if (!stored) throw new Error(`Gambar ${asset.id} belum tersedia. Buka buku dan unduh gambar sebelum membuat cadangan.`);
    const bytes = new Uint8Array(await stored.blob.arrayBuffer());
    if (bytes.length > MAX_ASSET_BYTES) throw new Error(`Gambar ${asset.id} melebihi batas 20 MB.`);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    assets.push({ bookId: book.id, assetId: asset.id, mediaType: stored.mediaType, base64: btoa(binary) });
  }
  return assets;
}

export async function restoreBookAssets(books: Book[], data: unknown, backend: DocumentAssetStoreBackend = store): Promise<void> {
  if (!Array.isArray(data)) throw new Error('Aset cadangan tidak valid.');
  const pending: { book: Book; asset: NonNullable<Book['assets']>[number]; blob: Blob }[] = [];
  const seen = new Set<string>();
  for (const row of data) {
    const book = books.find(book => book.id === row?.bookId);
    const asset = book?.assets?.find(asset => asset.id === row?.assetId);
    const key = JSON.stringify([row?.bookId, row?.assetId]);
    if (!book || !asset || seen.has(key) || typeof row.base64 !== 'string'
      || row.base64.length > Math.ceil(MAX_ASSET_BYTES / 3) * 4
      || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(row.base64)
      || row.mediaType !== asset.mediaType) throw new Error('Aset cadangan tidak valid.');
    const bytes = Uint8Array.from(atob(row.base64), c => c.charCodeAt(0));
    if (bytes.length !== asset.byteSize) throw new Error(`Ukuran gambar ${asset.id} tidak sesuai.`);
    pending.push({ book, asset, blob: new Blob([bytes], { type: asset.mediaType }) });
    seen.add(key);
  }
  for (const book of books) for (const asset of book.assets || []) {
    if (!seen.has(JSON.stringify([book.id, asset.id]))) throw new Error(`Gambar ${asset.id} tidak ada dalam cadangan.`);
  }
  for (const { book, asset, blob } of pending) await backend.saveAsset(book.id, asset, blob);
}
