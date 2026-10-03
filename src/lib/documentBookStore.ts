import type { Book } from '../types';

export interface DocumentBookStore {
  getAll(scope: string): Promise<Book[]>;
  save(scope: string, book: Book): Promise<void>;
  remove(scope: string, bookId: string): Promise<void>;
}

export class IndexedDbDocumentBookStore implements DocumentBookStore {
  private dbPromise?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('f15-document-books', 1);
        request.onupgradeneeded = () => {
          const store = request.result.createObjectStore('books', { keyPath: ['scope', 'id'] });
          store.createIndex('scope', 'scope');
        };
        request.onsuccess = () => {
          request.result.onversionchange = () => { request.result.close(); this.dbPromise = undefined; };
          resolve(request.result);
        };
        request.onerror = () => { this.dbPromise = undefined; reject(request.error); };
      });
    }
    return this.dbPromise;
  }

  async getAll(scope: string): Promise<Book[]> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('books', 'readonly');
      const request = tx.objectStore('books').index('scope').getAll(scope);
      tx.oncomplete = () => resolve((request.result as { book: Book }[]).map(row => row.book));
      tx.onabort = () => reject(tx.error || new Error('Gagal membaca buku lokal.'));
    });
  }

  private async write(action: (store: IDBObjectStore) => void): Promise<void> {
    const db = await this.open();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('books', 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error || new Error('Gagal menyimpan buku. Periksa kapasitas penyimpanan browser.'));
      action(tx.objectStore('books'));
    });
  }

  save(scope: string, book: Book): Promise<void> {
    return this.write(store => { store.put({ scope, id: book.id, book }); });
  }

  remove(scope: string, bookId: string): Promise<void> {
    return this.write(store => { store.delete([scope, bookId]); });
  }

  replace(scope: string, books: Book[]): Promise<void> {
    return this.write(store => {
      const cursor = store.index('scope').openCursor(scope);
      cursor.onsuccess = () => {
        if (cursor.result) { cursor.result.delete(); cursor.result.continue(); }
        else books.forEach(book => store.put({ scope, id: book.id, book }));
      };
    });
  }
}

export async function migrateLegacyBooks(
  store: Pick<DocumentBookStore, 'getAll' | 'save'>,
  scope: string,
  storage: Pick<Storage, 'getItem' | 'removeItem'>,
  key: string,
): Promise<Book[]> {
  const existing = await store.getAll(scope);
  const raw = storage.getItem(key);
  if (!raw) return existing;
  const legacy: Book[] = JSON.parse(raw);
  if (!Array.isArray(legacy) || legacy.some(book => !book?.id || !Array.isArray(book.chapters))) {
    throw new Error('Data buku lama tidak valid. Salinan lama tetap disimpan.');
  }
  const ids = new Set(existing.map(book => book.id));
  for (const book of legacy) if (!ids.has(book.id)) await store.save(scope, book);
  // Remove the old copy only after every complete book has been committed.
  storage.removeItem(key);
  return store.getAll(scope);
}

export const documentBookStore = new IndexedDbDocumentBookStore();
