import type { DocumentAsset } from '../types';
import { type DocumentAssetStoreBackend, IndexedDbDocumentAssetStore } from './documentAssetStore';

const browserDocumentAssetStore = new IndexedDbDocumentAssetStore();

export async function persistDocumentAssets(
  bookId: string,
  assets: DocumentAsset[] | undefined,
  assetBlobs: Map<string, Blob> | undefined,
  store: DocumentAssetStoreBackend = browserDocumentAssetStore,
): Promise<void> {
  if (!assets?.length || !assetBlobs?.size) return;

  await Promise.all(assets.flatMap((asset) => {
    const blob = assetBlobs.get(asset.id);
    return blob ? [store.saveAsset(bookId, asset, blob)] : [];
  }));
}
