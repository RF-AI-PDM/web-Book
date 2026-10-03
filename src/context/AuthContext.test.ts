// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Book } from '../types';
import { Blob as NodeBlob } from 'node:buffer';

const cloud = vi.hoisted(() => ({
  authCallback: null as ((user: unknown, token: null) => Promise<void>) | null,
  subscriptionCallback: null as ((sub: unknown) => void) | null,
  fetchSubscription: vi.fn(async (): Promise<unknown> => null),
  syncCustomBook: vi.fn(async () => {}),
}));
vi.mock('../lib/firebase', () => ({
  initAuthListener: (callback: typeof cloud.authCallback) => { cloud.authCallback = callback; return () => {}; },
  listenSharedHighlights: () => () => {},
  fetchSubscriptionFromCloud: cloud.fetchSubscription,
  fetchSavedBooksFromCloud: async () => [], fetchAnnotationsFromCloud: async () => [],
  fetchReadingHistoryFromCloud: async () => [], fetchCustomBooksFromCloud: async () => [],
  fetchCatalogBooksFromCloud: async () => [], fetchReadingGoalFromCloud: async () => null,
  fetchDailyReadingLogsFromCloud: async () => ({}),
  syncReadingGoalToCloud: async () => {}, syncDailyReadingLogsToCloud: async () => {},
  syncReadingHistoryToCloud: async () => {}, syncSavedBookToCloud: async () => {},
  syncAnnotationToCloud: async () => {}, syncCustomBookToCloud: cloud.syncCustomBook,
  deleteCustomBookFromCloud: async () => {}, logOut: async () => {},
  listenSavedBooks: () => () => {}, listenAnnotations: () => () => {}, listenReadingHistory: () => () => {},
  listenSubscription: (_uid: string, callback: typeof cloud.subscriptionCallback) => { cloud.subscriptionCallback = callback; return () => {}; },
  listenCatalogBooks: () => () => {},
}));
import { AuthProvider, useAuth } from './AuthContext';
import { documentBookStore } from '../lib/documentBookStore';
import { saveDocumentAsset, getDocumentAsset } from '../lib/documentAssetStore';

const fixture = (id: string): Book => ({ id, title: 'Buku Uji', author: 'Penulis', category: 'Uji',
  subtitle: '', description: '', coverColor: '', coverAccent: '', readTimeMinutes: 15,
  chapters: [{ id: 'ch', number: 1, title: 'Bab', readTimeMinutes: 15, content: ['satu', 'dua', 'tiga'] }] });
let api: ReturnType<typeof useAuth>;
let root: Root;
let container: HTMLDivElement;
function Probe() { api = useAuth(); return React.createElement('span', null, api.customBooks.length); }
async function mount() {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => { root.render(React.createElement(AuthProvider, null, React.createElement(Probe))); });
  await act(async () => { await cloud.authCallback!(null, null); });
}
async function login(uid: string) {
  await act(async () => { await cloud.authCallback!({ uid, metadata: {} }, null); });
}
beforeEach(async () => {
  vi.stubGlobal('Blob', NodeBlob);
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  cloud.fetchSubscription.mockResolvedValue(null);
  cloud.syncCustomBook.mockClear();
  await documentBookStore.replace('personal:guest', []);
});
afterEach(async () => { if (root) await act(async () => root.unmount()); container?.remove(); vi.unstubAllGlobals(); });

describe('local-first library integration', () => {
  it('does not grant VIP from localStorage, backup, or a previous account', async () => {
    const vip = { tier: 'vip_yearly', isActive: true, expiresAt: '2099-01-01' };
    localStorage.setItem('f15_subscription', JSON.stringify(vip));
    await mount();
    expect(api.isVip).toBe(false);
    await act(async () => { await api.importBackup(JSON.stringify({ savedBooks: [], subscription: vip })); });
    expect(api.isVip).toBe(false);
    cloud.fetchSubscription.mockResolvedValue(vip);
    await login('vip-owner');
    expect(api.isVip).toBe(true);
    await act(async () => { cloud.subscriptionCallback!(null); });
    expect(api.isVip).toBe(false);
    cloud.fetchSubscription.mockResolvedValue(null);
    await login('free-owner');
    expect(api.isVip).toBe(false);
  });
  it('keeps personal books separate when switching accounts and returning to guest mode', async () => {
    await mount();
    const guest = fixture(`guest-${crypto.randomUUID()}`);
    await act(async () => { await api.addCustomBook(guest); });
    const owner = `owner-${crypto.randomUUID()}`;
    await login(owner);
    expect(api.customBooks).toEqual([]);
    const personal = fixture(`personal-${crypto.randomUUID()}`);
    await act(async () => { await api.addCustomBook(personal); });
    await login(`other-${crypto.randomUUID()}`);
    expect(api.customBooks).toEqual([]);
    await login(owner);
    expect(api.customBooks).toEqual([personal]);
    await act(async () => { await cloud.authCallback!(null, null); });
    expect(api.customBooks).toEqual([guest]);
  });
  it('does not show a book as saved when its durable storage write fails', async () => {
    await mount();
    const save = vi.spyOn(documentBookStore, 'save').mockRejectedValueOnce(new Error('Quota exceeded'));
    await act(async () => { await expect(api.addCustomBook(fixture('failed'))).rejects.toThrow('Quota exceeded'); });
    expect(api.customBooks).toEqual([]);
    save.mockRestore();
  });
  it('does not count repeated progress updates at 100 percent twice', async () => {
    await mount();
    const book = fixture('completion');
    await act(async () => { await api.updateBookProgress(book, 'ch', 'Bab', 100); await api.updateBookProgress(book, 'ch', 'Bab', 100); });
    expect(api.readingStats.completedCount).toBe(1);
  });
  it('exports, restores and deletes complete books together with their illustrations', async () => {
    await mount();
    const book = { ...fixture(`illustrated-${crypto.randomUUID()}`), assets: [{ id: 'img', mediaType: 'image/png', byteSize: 3 }] };
    await saveDocumentAsset(book.id, book.assets[0], new Blob(['png'], { type: 'image/png' }));
    await act(async () => { await api.addCustomBook(book); });
    const backup = await api.exportBackup();
    await act(async () => { await api.deleteCustomBook(book.id); });
    expect(await getDocumentAsset(book.id, 'img')).toBeNull();
    await act(async () => { expect(await api.importBackup(backup)).toBe(true); });
    expect(api.customBooks).toEqual([book]);
    expect(await (await getDocumentAsset(book.id, 'img'))?.blob.text()).toBe('png');
  });
});
