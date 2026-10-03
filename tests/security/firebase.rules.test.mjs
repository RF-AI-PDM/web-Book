import { readFile } from 'node:fs/promises';
import { before, after, test } from 'node:test';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getBytes, deleteObject, listAll } from 'firebase/storage';

let environment;
before(async () => {
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_STORAGE_EMULATOR_HOST) {
    throw new Error('Run with Firebase emulators: firebase emulators:exec --only firestore,storage --project demo-f15 "node --test tests/security/firebase.rules.test.mjs"');
  }
  environment = await initializeTestEnvironment({ projectId: 'demo-f15',
    firestore: { rules: await readFile('firestore.rules', 'utf8') },
    storage: { rules: await readFile('storage.rules', 'utf8') },
  });
});
after(async () => { await environment?.cleanup(); });

test('owners cannot grant, change, remove, or restore their own VIP entitlement', async () => {
  const owner = environment.authenticatedContext('owner').firestore();
  const user = doc(owner, 'users/owner');
  await assertFails(setDoc(user, { subscription: { tier: 'vip_yearly', isActive: true } }));
  await assertSucceeds(setDoc(user, { readingGoal: { targetMinutesPerDay: 15 } }));
  await environment.withSecurityRulesDisabled(async context => {
    await updateDoc(doc(context.firestore(), 'users/owner'), { subscription: { tier: 'vip_monthly', isActive: true } });
  });
  await assertFails(updateDoc(user, { subscription: { tier: 'vip_yearly', isActive: true } }));
  await assertFails(setDoc(user, { readingGoal: { targetMinutesPerDay: 30 } }));
  await assertFails(deleteDoc(user));
  await assertSucceeds(updateDoc(user, { readingGoal: { targetMinutesPerDay: 30 } }));
  await assertFails(getDoc(doc(environment.authenticatedContext('other').firestore(), 'users/owner')));
});

test('trusted admins can update entitlements, and normal users cannot grant themselves admin', async () => {
  const admin = environment.authenticatedContext('admin', { admin: true }).firestore();
  await assertSucceeds(updateDoc(doc(admin, 'users/owner'), { subscription: { tier: 'vip_yearly', isActive: true } }));
  const owner = environment.authenticatedContext('owner').firestore();
  await assertFails(setDoc(doc(owner, 'admins/owner'), { admin: true }));
  await assertSucceeds(setDoc(doc(admin, 'users/new-reader'), { subscription: { tier: 'vip_monthly', isActive: true } }));
});

test('admins registered in Firestore work without an admin token claim', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'admins/registered-admin'), { admin: true });
  });
  const registered = environment.authenticatedContext('registered-admin');
  await assertSucceeds(setDoc(doc(registered.firestore(), 'catalog/registered-book'), { title: 'Admin catalog book' }));
  const path = 'catalog/registered-book/assets/image';
  await assertSucceeds(uploadBytes(ref(registered.storage(), path), new Uint8Array([1]), { contentType: 'image/png' }));
  await assertSucceeds(deleteObject(ref(registered.storage(), path)));
});

test('personal book chapters are readable only by their owner', async () => {
  const path = 'users/reader/customBooks/book/chapters/chapter';
  await assertSucceeds(setDoc(doc(environment.authenticatedContext('reader').firestore(), path), { content: ['Complete chapter'] }));
  await assertFails(getDoc(doc(environment.authenticatedContext('other').firestore(), path)));
  await assertFails(getDoc(doc(environment.unauthenticatedContext().firestore(), path)));
});

test('personal images allow owner upload/download/list/delete and deny other users', async () => {
  const path = 'users/reader/customBooks/book/assets/image';
  const owner = environment.authenticatedContext('reader').storage();
  await assertSucceeds(uploadBytes(ref(owner, path), new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
  await assertSucceeds(getBytes(ref(owner, path)));
  await assertSucceeds(listAll(ref(owner, 'users/reader/customBooks/book/assets')));
  const other = environment.authenticatedContext('other').storage();
  await assertFails(getBytes(ref(other, path)));
  await assertFails(uploadBytes(ref(other, path), new Uint8Array([1]), { contentType: 'image/png' }));
  await assertFails(deleteObject(ref(other, path)));
  await assertFails(getBytes(ref(environment.unauthenticatedContext().storage(), path)));
  await assertSucceeds(deleteObject(ref(owner, path)));
});

test('catalog images are publicly readable but only admins can upload or delete them', async () => {
  const path = 'catalog/book/assets/image';
  const admin = environment.authenticatedContext('admin', { admin: true }).storage();
  await assertSucceeds(uploadBytes(ref(admin, path), new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
  await assertSucceeds(getBytes(ref(environment.unauthenticatedContext().storage(), path)));
  const reader = environment.authenticatedContext('reader').storage();
  await assertFails(uploadBytes(ref(reader, path), new Uint8Array([1]), { contentType: 'image/png' }));
  await assertFails(deleteObject(ref(reader, path)));
  await assertSucceeds(deleteObject(ref(admin, path)));
});

test('storage rejects non-image files and images over 20 MB', async () => {
  const owner = environment.authenticatedContext('reader').storage();
  const path = 'users/reader/customBooks/book/assets/rejected';
  await assertFails(uploadBytes(ref(owner, path), new Uint8Array([1]), { contentType: 'text/html' }));
  await assertFails(uploadBytes(ref(owner, path), new Uint8Array(20 * 1024 * 1024 + 1), { contentType: 'image/png' }));
});
