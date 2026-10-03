import { describe, expect, it } from 'vitest';
import { syncBookAssets, resolveAssetBlob, documentAssetPath } from './documentAssetCloud';
import { InMemoryDocumentAssetStore } from './documentAssetStore';
import type { Book, DocumentAsset } from '../types';

const asset: DocumentAsset = { id: 'img', mediaType: 'image/png', byteSize: 3 };
const book = { id: 'book', assets: [asset] } as Book;
describe('cloud image synchronization', () => {
  it('uploads local image bytes and produces a private storage path, without a public download URL', async () => {
    const local = new InMemoryDocumentAssetStore();
    await local.saveAsset(book.id, asset, new Blob(['png'], { type: asset.mediaType }));
    const uploaded: string[] = [];
    const result = await syncBookAssets(book, 'users/owner/customBooks', { upload: async path => { uploaded.push(path); }, download: async () => new Blob() }, local);
    expect(uploaded).toEqual(['users/owner/customBooks/book/assets/img']);
    expect(result.assets![0].storagePath).toBe(uploaded[0]);
    expect(result.assets![0].sourceUrl).toBeUndefined();
  });
  it('hydrates a missing image from cloud into the local store for offline reuse', async () => {
    const local = new InMemoryDocumentAssetStore();
    let downloads = 0;
    const cloudAsset = { ...asset, storagePath: 'catalog/book/assets/img' };
    const download = async () => { downloads++; return new Blob(['png'], { type: asset.mediaType }); };
    expect(await (await resolveAssetBlob('book', cloudAsset, download, local))?.text()).toBe('png');
    await resolveAssetBlob('book', cloudAsset, download, local);
    expect(downloads).toBe(1);
  });
  it('fails on missing image bytes instead of marking an incomplete book synced', async () => {
    await expect(syncBookAssets(book, 'catalog', { upload: async () => {}, download: async () => new Blob() }, new InMemoryDocumentAssetStore())).rejects.toThrow('img');
  });
  it('rejects path traversal in book or asset ids', () => {
    expect(() => documentAssetPath('catalog', '../book', 'img')).toThrow();
    expect(() => documentAssetPath('catalog', 'book', 'img/path')).toThrow();
  });
});
