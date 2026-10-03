import { describe, expect, it } from 'vitest';
import type { DocumentAsset } from '../types';
import { InMemoryDocumentAssetStore } from './documentAssetStore';
import { persistDocumentAssets } from './documentAssetPersistence';

describe('persistDocumentAssets', () => {
  it('stores only Blob-backed assets under the new book id', async () => {
    const store = new InMemoryDocumentAssetStore();
    const assets: DocumentAsset[] = [
      { id: 'diagram', mediaType: 'image/png', byteSize: 3, sourceUrl: 'blob:temporary' },
      { id: 'missing', mediaType: 'image/png', byteSize: 0 },
    ];

    await persistDocumentAssets('uploaded-book', assets, new Map([['diagram', new Blob(['png'], { type: 'image/png' })]]), store);

    expect(await store.getAsset('uploaded-book', 'diagram')).toMatchObject({ assetId: 'diagram', sourceUrl: undefined });
    expect(await store.getAsset('uploaded-book', 'missing')).toBeNull();
  });
});
