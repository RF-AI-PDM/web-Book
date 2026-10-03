import { getStorage, ref, uploadBytes, getBlob, listAll, deleteObject } from 'firebase/storage';
import { app } from './firebase';
import { MAX_DOCUMENT_ASSET_BYTES } from './documentAssetCloud';

export async function uploadDocumentAsset(path: string, blob: Blob): Promise<void> {
  await uploadBytes(ref(getStorage(app), path), blob, { contentType: blob.type });
}

export async function downloadDocumentAsset(path: string): Promise<Blob> {
  // getBlob uses authenticated rules instead of persistent public download tokens.
  return getBlob(ref(getStorage(app), path), MAX_DOCUMENT_ASSET_BYTES);
}

export async function deleteCloudBookAssets(prefix: string, bookId: string): Promise<void> {
  const directory = ref(getStorage(app), `${prefix}/${bookId}/assets`);
  const listing = await listAll(directory);
  for (const item of listing.items) await deleteObject(item);
}
