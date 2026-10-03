import { describe, expect, it } from 'vitest';
import { exportBookAssets, restoreBookAssets } from './documentBackup';
import { InMemoryDocumentAssetStore } from './documentAssetStore';
import type { Book } from '../types';

const book = { id: 'backup-book', assets: [{ id: 'image', mediaType: 'image/png', byteSize: 3 }] } as Book;
describe('portable document assets', () => {
  it('round-trips image bytes to a new store, without persisting temporary URLs', async () => {
    const source = new InMemoryDocumentAssetStore();
    const destination = new InMemoryDocumentAssetStore();
    await source.saveAsset(book.id, book.assets![0], new Blob([new Uint8Array([0, 128, 255])], { type: 'image/png' }));
    const backup = await exportBookAssets([book], source);
    await restoreBookAssets([book], backup, destination);
    expect([...new Uint8Array(await (await destination.getAsset(book.id, 'image'))!.blob.arrayBuffer())]).toEqual([0, 128, 255]);
  });
  it('rejects a backup with missing image bytes instead of reporting a complete backup', async () => {
    await expect(exportBookAssets([book], new InMemoryDocumentAssetStore())).rejects.toThrow('image');
    await expect(restoreBookAssets([book], [], new InMemoryDocumentAssetStore())).rejects.toThrow('image');
  });
  it('validates all assets before writing any of them', async () => {
    const store = new InMemoryDocumentAssetStore();
    await expect(restoreBookAssets([book], [
      { bookId: book.id, assetId: 'image', mediaType: 'image/png', base64: 'AID/' },
      { bookId: 'unknown', assetId: 'extra', mediaType: 'image/png', base64: '!!!!' },
    ], store)).rejects.toThrow();
    expect(await store.getAsset(book.id, 'image')).toBeNull();
  });
});
