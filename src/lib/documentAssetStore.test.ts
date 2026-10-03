import { describe, expect, it } from 'vitest';
import 'fake-indexeddb/auto';
import type { DocumentAsset } from '../types';
import { IndexedDbDocumentAssetStore, InMemoryDocumentAssetStore } from './documentAssetStore';

function makeAsset(overrides: Partial<DocumentAsset> = {}): DocumentAsset {
  return {
    id: 'img-1',
    mediaType: 'image/png',
    fileName: 'diagram.png',
    sourcePath: 'OPS/images/diagram.png',
    sourceUrl: 'blob:temporary-parser-url',
    byteSize: 3,
    ...overrides,
  };
}

describe('InMemoryDocumentAssetStore', () => {
  it('saves and reads Blob assets without persisting parser object URLs', async () => {
    const store = new InMemoryDocumentAssetStore();
    const blob = new Blob(['abc'], { type: 'image/png' });

    const stored = await store.saveAsset('book-1', makeAsset(), blob);
    const loaded = await store.getAsset('book-1', 'img-1');

    expect(stored.sourceUrl).toBeUndefined();
    expect(loaded?.blob).toBe(blob);
    expect(loaded?.byteSize).toBe(3);
    expect(loaded?.mediaType).toBe('image/png');
    expect(await loaded?.blob.text()).toBe('abc');
  });

  it('creates revocable object URLs and only revokes once', async () => {
    const calls: string[] = [];
    const store = new InMemoryDocumentAssetStore({
      createObjectURL: () => 'blob:resolved-url',
      revokeObjectURL: (url: string) => calls.push(url),
    });

    await store.saveAsset('book-1', makeAsset(), new Blob(['abc'], { type: 'image/png' }));
    const resolved = await store.createObjectUrl('book-1', 'img-1');

    expect(resolved?.url).toBe('blob:resolved-url');
    resolved?.revoke();
    resolved?.revoke();
    expect(calls).toEqual(['blob:resolved-url']);
  });

  it('deletes one asset or every asset for a book without touching another book', async () => {
    const store = new InMemoryDocumentAssetStore();

    await store.saveAsset('book-1', makeAsset({ id: 'img-1' }), new Blob(['1']));
    await store.saveAsset('book-1', makeAsset({ id: 'img-2' }), new Blob(['2']));
    await store.saveAsset('book-2', makeAsset({ id: 'img-1' }), new Blob(['3']));

    await store.deleteAsset('book-1', 'img-1');
    expect(await store.getAsset('book-1', 'img-1')).toBeNull();
    expect(await store.getAsset('book-1', 'img-2')).not.toBeNull();

    await store.deleteAssetsForBook('book-1');
    expect(await store.getAsset('book-1', 'img-2')).toBeNull();
    expect(await store.getAsset('book-2', 'img-1')).not.toBeNull();
  });
});

describe('IndexedDbDocumentAssetStore', () => {
  it('keeps a Blob available to a fresh store instance without persisting its temporary URL', async () => {
    const asset = makeAsset({ id: `reload-${crypto.randomUUID()}` });
    const firstStore = new IndexedDbDocumentAssetStore();

    await firstStore.saveAsset('book-after-reload', asset, new Blob(['offline illustration'], { type: 'image/png' }));

    const reloadedStore = new IndexedDbDocumentAssetStore();
    const restored = await reloadedStore.getAsset('book-after-reload', asset.id);

    expect(restored?.sourceUrl).toBeUndefined();
    expect(restored?.mediaType).toBe('image/png');
    expect(await restored?.blob.text()).toBe('offline illustration');
  });

  it('removes only the selected book assets from IndexedDB', async () => {
    const store = new IndexedDbDocumentAssetStore();
    const suffix = crypto.randomUUID();
    const firstAsset = makeAsset({ id: `first-${suffix}` });
    const secondAsset = makeAsset({ id: `second-${suffix}` });

    await store.saveAsset(`delete-${suffix}`, firstAsset, new Blob(['remove me']));
    await store.saveAsset(`keep-${suffix}`, secondAsset, new Blob(['keep me']));
    await store.deleteAssetsForBook(`delete-${suffix}`);

    expect(await store.getAsset(`delete-${suffix}`, firstAsset.id)).toBeNull();
    expect(await store.getAsset(`keep-${suffix}`, secondAsset.id)).not.toBeNull();
  });
});
