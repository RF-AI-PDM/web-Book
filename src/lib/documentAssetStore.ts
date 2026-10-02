import type { DocumentAsset } from '../types';

export interface StoredDocumentAsset extends DocumentAsset {
  bookId: string;
  assetId: string;
  blob: Blob;
  updatedAt: string;
}

export interface ResolvedDocumentAssetUrl {
  url: string;
  revoke: () => void;
}

export interface DocumentAssetStoreBackend {
  saveAsset(bookId: string, asset: DocumentAsset, blob: Blob): Promise<StoredDocumentAsset>;
  getAsset(bookId: string, assetId: string): Promise<StoredDocumentAsset | null>;
  deleteAsset(bookId: string, assetId: string): Promise<void>;
  deleteAssetsForBook(bookId: string): Promise<void>;
  createObjectUrl(bookId: string, assetId: string): Promise<ResolvedDocumentAssetUrl | null>;
}

const DB_NAME = 'evolusi-book-document-assets';
const DB_VERSION = 1;
const STORE_NAME = 'assets';
const BOOK_ID_INDEX = 'bookId';

function getAssetKey(bookId: string, assetId: string): [string, string] {
  return [bookId, assetId];
}

function assertBrowserIndexedDbAvailable(): IDBFactory {
  if (typeof indexedDB === 'undefined') {
    throw new Error('IndexedDB tidak tersedia di runtime ini. Aset dokumen hanya dapat disimpan di browser.');
  }
  return indexedDB;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request gagal.'));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction gagal.'));
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction dibatalkan.'));
  });
}

function normalizeStoredAsset(bookId: string, asset: DocumentAsset, blob: Blob): StoredDocumentAsset {
  return {
    ...asset,
    id: asset.id,
    bookId,
    assetId: asset.id,
    blob,
    mediaType: asset.mediaType || blob.type || 'application/octet-stream',
    byteSize: asset.byteSize || blob.size,
    // Object URLs are process-lifetime values. Never persist them into IndexedDB metadata.
    sourceUrl: undefined,
    updatedAt: new Date().toISOString(),
  };
}

export class IndexedDbDocumentAssetStore implements DocumentAssetStoreBackend {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = assertBrowserIndexedDbAvailable().open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: ['bookId', 'assetId'] });
          store.createIndex(BOOK_ID_INDEX, 'bookId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Gagal membuka IndexedDB aset dokumen.'));
    });

    return this.dbPromise;
  }

  async saveAsset(bookId: string, asset: DocumentAsset, blob: Blob): Promise<StoredDocumentAsset> {
    const db = await this.openDb();
    const stored = normalizeStoredAsset(bookId, asset, blob);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(stored);
    await transactionDone(tx);
    return stored;
  }

  async getAsset(bookId: string, assetId: string): Promise<StoredDocumentAsset | null> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const result = await requestToPromise<StoredDocumentAsset | undefined>(
      tx.objectStore(STORE_NAME).get(getAssetKey(bookId, assetId)),
    );
    await transactionDone(tx);
    return result || null;
  }

  async deleteAsset(bookId: string, assetId: string): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(getAssetKey(bookId, assetId));
    await transactionDone(tx);
  }

  async deleteAssetsForBook(bookId: string): Promise<void> {
    const db = await this.openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const index = tx.objectStore(STORE_NAME).index(BOOK_ID_INDEX);
    const request = index.openCursor(IDBKeyRange.only(bookId));

    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve();
          return;
        }
        cursor.delete();
        cursor.continue();
      };
      request.onerror = () => reject(request.error || new Error('Gagal membersihkan aset buku.'));
    });
    await transactionDone(tx);
  }

  async createObjectUrl(bookId: string, assetId: string): Promise<ResolvedDocumentAssetUrl | null> {
    const stored = await this.getAsset(bookId, assetId);
    if (!stored) return null;
    const url = URL.createObjectURL(stored.blob);
    let revoked = false;
    return {
      url,
      revoke: () => {
        if (revoked) return;
        URL.revokeObjectURL(url);
        revoked = true;
      },
    };
  }
}

export class InMemoryDocumentAssetStore implements DocumentAssetStoreBackend {
  private assets = new Map<string, StoredDocumentAsset>();

  constructor(
    private readonly urlFactory: Pick<typeof URL, 'createObjectURL' | 'revokeObjectURL'> = URL,
  ) {}

  private key(bookId: string, assetId: string): string {
    return `${bookId}\u0000${assetId}`;
  }

  async saveAsset(bookId: string, asset: DocumentAsset, blob: Blob): Promise<StoredDocumentAsset> {
    const stored = normalizeStoredAsset(bookId, asset, blob);
    this.assets.set(this.key(bookId, asset.id), stored);
    return stored;
  }

  async getAsset(bookId: string, assetId: string): Promise<StoredDocumentAsset | null> {
    return this.assets.get(this.key(bookId, assetId)) || null;
  }

  async deleteAsset(bookId: string, assetId: string): Promise<void> {
    this.assets.delete(this.key(bookId, assetId));
  }

  async deleteAssetsForBook(bookId: string): Promise<void> {
    for (const key of [...this.assets.keys()]) {
      if (key.startsWith(`${bookId}\u0000`)) this.assets.delete(key);
    }
  }

  async createObjectUrl(bookId: string, assetId: string): Promise<ResolvedDocumentAssetUrl | null> {
    const stored = await this.getAsset(bookId, assetId);
    if (!stored) return null;
    const url = this.urlFactory.createObjectURL(stored.blob);
    let revoked = false;
    return {
      url,
      revoke: () => {
        if (revoked) return;
        this.urlFactory.revokeObjectURL(url);
        revoked = true;
      },
    };
  }
}

const defaultDocumentAssetStore = new IndexedDbDocumentAssetStore();

export function saveDocumentAsset(bookId: string, asset: DocumentAsset, blob: Blob) {
  return defaultDocumentAssetStore.saveAsset(bookId, asset, blob);
}

export function getDocumentAsset(bookId: string, assetId: string) {
  return defaultDocumentAssetStore.getAsset(bookId, assetId);
}

export function deleteDocumentAsset(bookId: string, assetId: string) {
  return defaultDocumentAssetStore.deleteAsset(bookId, assetId);
}

export function deleteDocumentAssetsForBook(bookId: string) {
  return defaultDocumentAssetStore.deleteAssetsForBook(bookId);
}

export function createDocumentAssetObjectUrl(bookId: string, assetId: string) {
  return defaultDocumentAssetStore.createObjectUrl(bookId, assetId);
}
