import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { Book } from '../types';
import { IndexedDbDocumentBookStore, migrateLegacyBooks } from './documentBookStore';

const book = (id: string): Book => ({ id, title: id, author: 'A', category: 'B', readTimeMinutes: 15,
  subtitle: '', description: '', coverColor: '', coverAccent: '', chapters: [{ id: 'c1', number: 1,
    title: 'Bab', readTimeMinutes: 15, content: ['a', 'b', 'c', 'x'.repeat(6_000_000)],
    blocks: [{ id: 'image', type: 'image', assetId: 'img', alt: 'Diagram' }] }] });

describe('document book persistence', () => {
  it('preserves all paragraphs and blocks after reload, including books larger than localStorage', async () => {
    const scope = crypto.randomUUID();
    await new IndexedDbDocumentBookStore().save(scope, book('large'));
    expect(await new IndexedDbDocumentBookStore().getAll(scope)).toEqual([book('large')]);
  });
  it('isolates collections and removes only the selected book', async () => {
    const store = new IndexedDbDocumentBookStore();
    const scope = crypto.randomUUID();
    await store.save(scope, book('first'));
    await store.save(scope, book('second'));
    await store.save(`${scope}-other`, book('first'));
    await store.remove(scope, 'first');
    expect((await store.getAll(scope)).map(b => b.id)).toEqual(['second']);
    expect(await store.getAll(`${scope}-other`)).toHaveLength(1);
  });
  it('migrates once without overwriting newer IndexedDB data', async () => {
    const store = new IndexedDbDocumentBookStore();
    const scope = crypto.randomUUID();
    const entries = new Map([['legacy', JSON.stringify([book('old')])]]);
    const storage = { getItem: (key: string) => entries.get(key) ?? null, removeItem: (key: string) => { entries.delete(key); } };
    await store.save(scope, { ...book('old'), title: 'Newer' });
    await migrateLegacyBooks(store, scope, storage, 'legacy');
    expect((await store.getAll(scope))[0].title).toBe('Newer');
    expect(entries.has('legacy')).toBe(false);
    await migrateLegacyBooks(store, scope, storage, 'legacy');
    expect(await store.getAll(scope)).toHaveLength(1);
  });
  it('keeps the legacy copy when migration fails', async () => {
    const entries = new Map([['legacy', JSON.stringify([book('old')])]]);
    const storage = { getItem: (key: string) => entries.get(key) ?? null, removeItem: (key: string) => { entries.delete(key); } };
    const store = { getAll: async () => [], save: async () => { throw new Error('Quota exceeded'); } };
    await expect(migrateLegacyBooks(store, 'personal', storage, 'legacy')).rejects.toThrow('Quota exceeded');
    expect(entries.has('legacy')).toBe(true);
  });
});
