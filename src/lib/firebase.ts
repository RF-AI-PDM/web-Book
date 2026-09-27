import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  getDocFromServer,
  collection,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Annotation, SavedBook, SharedHighlight, ReadingGoal } from '../types';

export const app = initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Test connection on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Verify network configuration.');
    }
  }
}
testFirestoreConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// In-memory access token cache for Google Workspace integration
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/chat.messages.create'
];

const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

export const initAuthListener = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Firestore Cloud Library Services
export async function syncSavedBookToCloud(userId: string, book: SavedBook) {
  const path = `users/${userId}/savedBooks/${book.bookId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedBooks', book.bookId);
    await setDoc(docRef, book, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeSavedBookFromCloud(userId: string, bookId: string) {
  const path = `users/${userId}/savedBooks/${bookId}`;
  try {
    const docRef = doc(db, 'users', userId, 'savedBooks', bookId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchSavedBooksFromCloud(userId: string): Promise<SavedBook[]> {
  const path = `users/${userId}/savedBooks`;
  try {
    const colRef = collection(db, 'users', userId, 'savedBooks');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => d.data() as SavedBook);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function syncAnnotationToCloud(userId: string, annotation: Annotation) {
  const path = `users/${userId}/annotations/${annotation.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'annotations', annotation.id);
    await setDoc(docRef, annotation, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteAnnotationFromCloud(userId: string, annotationId: string) {
  const path = `users/${userId}/annotations/${annotationId}`;
  try {
    const docRef = doc(db, 'users', userId, 'annotations', annotationId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchAnnotationsFromCloud(userId: string): Promise<Annotation[]> {
  const path = `users/${userId}/annotations`;
  try {
    const colRef = collection(db, 'users', userId, 'annotations');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => d.data() as Annotation);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// Reading History & Progress Sync (Cross-Device)
export async function syncReadingHistoryToCloud(userId: string, item: SavedBook) {
  const path = `users/${userId}/readingHistory/${item.bookId}`;
  try {
    const docRef = doc(db, 'users', userId, 'readingHistory', item.bookId);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeReadingHistoryFromCloud(userId: string, bookId: string) {
  const path = `users/${userId}/readingHistory/${bookId}`;
  try {
    const docRef = doc(db, 'users', userId, 'readingHistory', bookId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchReadingHistoryFromCloud(userId: string): Promise<SavedBook[]> {
  const path = `users/${userId}/readingHistory`;
  try {
    const colRef = collection(db, 'users', userId, 'readingHistory');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => d.data() as SavedBook);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

// Real-Time Cross-Device Listeners
export function listenSavedBooks(userId: string, callback: (books: SavedBook[]) => void) {
  const colRef = collection(db, 'users', userId, 'savedBooks');
  return onSnapshot(colRef, (snapshot) => {
    const books = snapshot.docs.map(d => d.data() as SavedBook);
    callback(books);
  }, (err) => {
    console.warn('Real-time saved books listener warning:', err.message);
  });
}

export function listenAnnotations(userId: string, callback: (annotations: Annotation[]) => void) {
  const colRef = collection(db, 'users', userId, 'annotations');
  return onSnapshot(colRef, (snapshot) => {
    const annotations = snapshot.docs.map(d => d.data() as Annotation);
    callback(annotations);
  }, (err) => {
    console.warn('Real-time annotations listener warning:', err.message);
  });
}

export function listenReadingHistory(userId: string, callback: (history: SavedBook[]) => void) {
  const colRef = collection(db, 'users', userId, 'readingHistory');
  return onSnapshot(colRef, (snapshot) => {
    const history = snapshot.docs.map(d => d.data() as SavedBook);
    callback(history);
  }, (err) => {
    console.warn('Real-time reading history listener warning:', err.message);
  });
}

// Community Shared Highlights Services
export async function publishSharedHighlightToCloud(highlight: SharedHighlight) {
  const path = `books/${highlight.bookId}/sharedHighlights/${highlight.id}`;
  try {
    const docRef = doc(db, 'books', highlight.bookId, 'sharedHighlights', highlight.id);
    await setDoc(docRef, highlight, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function unpublishSharedHighlightFromCloud(bookId: string, highlightId: string) {
  const path = `books/${bookId}/sharedHighlights/${highlightId}`;
  try {
    const docRef = doc(db, 'books', bookId, 'sharedHighlights', highlightId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchSharedHighlightsFromCloud(bookId: string): Promise<SharedHighlight[]> {
  const path = `books/${bookId}/sharedHighlights`;
  try {
    const colRef = collection(db, 'books', bookId, 'sharedHighlights');
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => d.data() as SharedHighlight);
  } catch (error) {
    console.warn('Could not fetch shared highlights from cloud, falling back to cached:', error);
    return [];
  }
}

export function listenSharedHighlights(bookId: string, callback: (highlights: SharedHighlight[]) => void) {
  const colRef = collection(db, 'books', bookId, 'sharedHighlights');
  return onSnapshot(colRef, (snapshot) => {
    const highlights = snapshot.docs.map(d => d.data() as SharedHighlight);
    callback(highlights);
  }, (err) => {
    console.warn('Real-time shared highlights listener notice:', err.message);
  });
}

export async function toggleLikeSharedHighlightInCloud(
  bookId: string, 
  highlightId: string, 
  userId: string
): Promise<{ liked: boolean; newCount: number }> {
  const path = `books/${bookId}/sharedHighlights/${highlightId}`;
  try {
    const docRef = doc(db, 'books', bookId, 'sharedHighlights', highlightId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      return { liked: false, newCount: 0 };
    }
    const data = snap.data() as SharedHighlight;
    const currentLikedBy = data.likedBy || [];
    const isAlreadyLiked = currentLikedBy.includes(userId);

    const updatedLikedBy = isAlreadyLiked
      ? currentLikedBy.filter(id => id !== userId)
      : [...currentLikedBy, userId];

    const updatedCount = updatedLikedBy.length;

    await updateDoc(docRef, {
      likedBy: updatedLikedBy,
      likesCount: updatedCount
    });

    return { liked: !isAlreadyLiked, newCount: updatedCount };
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
    return { liked: false, newCount: 0 };
  }
}

export async function syncReadingGoalToCloud(userId: string, goal: ReadingGoal): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { readingGoal: goal, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchReadingGoalFromCloud(userId: string): Promise<ReadingGoal | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().readingGoal) {
      return snap.data().readingGoal as ReadingGoal;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function syncDailyReadingLogsToCloud(userId: string, logs: Record<string, number>): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { dailyReadingLogs: logs, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchDailyReadingLogsFromCloud(userId: string): Promise<Record<string, number> | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().dailyReadingLogs) {
      return snap.data().dailyReadingLogs as Record<string, number>;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

// ─── Subscription Sync ────────────────────────────────────────────────────────

import { SubscriptionInfo, Book, Chapter } from '../types';

export async function syncSubscriptionToCloud(userId: string, subscription: SubscriptionInfo): Promise<void> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { subscription, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchSubscriptionFromCloud(userId: string): Promise<SubscriptionInfo | null> {
  const path = `users/${userId}`;
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().subscription) {
      return snap.data().subscription as SubscriptionInfo;
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch subscription from cloud:', error);
    return null;
  }
}

export function listenSubscription(userId: string, callback: (sub: SubscriptionInfo | null) => void): () => void {
  const docRef = doc(db, 'users', userId);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists() && snap.data().subscription) {
      callback(snap.data().subscription as SubscriptionInfo);
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('Subscription listener warning:', err.message);
  });
}

// ─── Custom Books Sync (per-user with subcollection chapters) ─────────────────

export async function syncCustomBookToCloud(userId: string, book: Book): Promise<void> {
  const path = `users/${userId}/customBooks/${book.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'customBooks', book.id);
    
    // 1. Sync every chapter into its own subcollection document
    // This eliminates the 1MB Firestore limit, even for 500+ page books!
    if (book.chapters && book.chapters.length > 0) {
      await Promise.all(
        book.chapters.map(ch => {
          const chDocRef = doc(db, 'users', userId, 'customBooks', book.id, 'chapters', ch.id);
          return setDoc(chDocRef, ch, { merge: true });
        })
      );
    }

    // 2. Check total approximate size in bytes
    const jsonStr = JSON.stringify(book);
    const isLarge = jsonStr.length > 600 * 1024; // > 600KB

    // If large, strip chapter content in main doc so metadata stays tiny (< 20KB)
    const bookToSave: Book = isLarge ? {
      ...book,
      hasSubcollectionChapters: true,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        number: ch.number,
        title: ch.title,
        readTimeMinutes: ch.readTimeMinutes,
        keyQuote: ch.keyQuote,
        actionItem: ch.actionItem,
        content: []
      }))
    } : {
      ...book,
      hasSubcollectionChapters: true
    };

    await setDoc(docRef, bookToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCustomBookFromCloud(userId: string, bookId: string): Promise<void> {
  const path = `users/${userId}/customBooks/${bookId}`;
  try {
    const docRef = doc(db, 'users', userId, 'customBooks', bookId);
    
    // Clean up subcollection chapters first to prevent orphaned docs
    try {
      const chaptersCol = collection(db, 'users', userId, 'customBooks', bookId, 'chapters');
      const chSnap = await getDocs(chaptersCol);
      await Promise.all(chSnap.docs.map(d => deleteDoc(d.ref)));
    } catch (e) {
      console.warn('Could not clean up custom book chapters subcollection:', e);
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCustomBooksFromCloud(userId: string): Promise<Book[]> {
  const path = `users/${userId}/customBooks`;
  try {
    const colRef = collection(db, 'users', userId, 'customBooks');
    const snapshot = await getDocs(colRef);
    const books = await Promise.all(snapshot.docs.map(async (d) => {
      const data = d.data() as Book;
      const needsChapters = data.hasSubcollectionChapters && (!data.chapters || data.chapters.some(c => !c.content || c.content.length === 0));
      if (needsChapters) {
        try {
          const chaptersCol = collection(db, 'users', userId, 'customBooks', data.id, 'chapters');
          const chSnap = await getDocs(chaptersCol);
          if (!chSnap.empty) {
            const loadedChapters = chSnap.docs.map(docSnap => docSnap.data() as Chapter);
            loadedChapters.sort((a, b) => a.number - b.number);
            return {
              ...data,
              chapters: loadedChapters
            };
          }
        } catch (err) {
          console.warn(`Could not load chapters for custom book ${data.id}:`, err);
        }
      }
      return data;
    }));
    return books;
  } catch (error) {
    console.warn('Could not fetch custom books from cloud:', error);
    return [];
  }
}

// ─── Catalog Books Sync (global, admin-managed with subcollection chapters) ───

export async function syncCatalogBookToCloud(book: Book): Promise<void> {
  const path = `catalog/${book.id}`;
  try {
    const docRef = doc(db, 'catalog', book.id);
    
    // 1. Sync every chapter into its own subcollection document
    if (book.chapters && book.chapters.length > 0) {
      await Promise.all(
        book.chapters.map(ch => {
          const chDocRef = doc(db, 'catalog', book.id, 'chapters', ch.id);
          return setDoc(chDocRef, ch, { merge: true });
        })
      );
    }

    const jsonStr = JSON.stringify(book);
    const isLarge = jsonStr.length > 600 * 1024;

    const bookToSave: Book = isLarge ? {
      ...book,
      hasSubcollectionChapters: true,
      chapters: book.chapters.map(ch => ({
        id: ch.id,
        number: ch.number,
        title: ch.title,
        readTimeMinutes: ch.readTimeMinutes,
        keyQuote: ch.keyQuote,
        actionItem: ch.actionItem,
        content: []
      }))
    } : {
      ...book,
      hasSubcollectionChapters: true
    };

    await setDoc(docRef, bookToSave, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteCatalogBookFromCloud(bookId: string): Promise<void> {
  const path = `catalog/${bookId}`;
  try {
    const docRef = doc(db, 'catalog', bookId);
    
    // Clean up subcollection chapters first
    try {
      const chaptersCol = collection(db, 'catalog', bookId, 'chapters');
      const chSnap = await getDocs(chaptersCol);
      await Promise.all(chSnap.docs.map(d => deleteDoc(d.ref)));
    } catch (e) {
      console.warn('Could not clean up catalog chapters subcollection:', e);
    }

    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchCatalogBooksFromCloud(): Promise<Book[]> {
  const path = `catalog`;
  try {
    const colRef = collection(db, 'catalog');
    const snapshot = await getDocs(colRef);
    const books = await Promise.all(snapshot.docs.map(async (d) => {
      const data = d.data() as Book;
      const needsChapters = data.hasSubcollectionChapters && (!data.chapters || data.chapters.some(c => !c.content || c.content.length === 0));
      if (needsChapters) {
        try {
          const chaptersCol = collection(db, 'catalog', data.id, 'chapters');
          const chSnap = await getDocs(chaptersCol);
          if (!chSnap.empty) {
            const loadedChapters = chSnap.docs.map(docSnap => docSnap.data() as Chapter);
            loadedChapters.sort((a, b) => a.number - b.number);
            return {
              ...data,
              chapters: loadedChapters
            };
          }
        } catch (err) {
          console.warn(`Could not load chapters for catalog book ${data.id}:`, err);
        }
      }
      return data;
    }));
    return books;
  } catch (error) {
    console.warn('Could not fetch catalog books from cloud:', error);
    return [];
  }
}

export function listenCatalogBooks(callback: (books: Book[]) => void): () => void {
  const colRef = collection(db, 'catalog');
  return onSnapshot(colRef, async (snapshot) => {
    const rawBooks = snapshot.docs.map(d => d.data() as Book);
    // If any book has empty chapter content, hydrate from subcollection
    const hydratedBooks = await Promise.all(rawBooks.map(async (data) => {
      const needsChapters = data.hasSubcollectionChapters && (!data.chapters || data.chapters.some(c => !c.content || c.content.length === 0));
      if (needsChapters) {
        try {
          const chaptersCol = collection(db, 'catalog', data.id, 'chapters');
          const chSnap = await getDocs(chaptersCol);
          if (!chSnap.empty) {
            const loadedChapters = chSnap.docs.map(docSnap => docSnap.data() as Chapter);
            loadedChapters.sort((a, b) => a.number - b.number);
            return {
              ...data,
              chapters: loadedChapters
            };
          }
        } catch (err) {
          console.warn(`Could not hydrate catalog book ${data.id}:`, err);
        }
      }
      return data;
    }));
    callback(hydratedBooks);
  }, (err) => {
    console.warn('Catalog books listener warning:', err.message);
  });
}

// ─── On-Demand Single Chapter Loader ──────────────────────────────────────────

export async function fetchBookChapterContent(
  bookId: string, 
  chapterId: string, 
  userId?: string
): Promise<string[] | null> {
  try {
    // 1. Check user custom book subcollection first if user provided
    if (userId) {
      const chDocRef = doc(db, 'users', userId, 'customBooks', bookId, 'chapters', chapterId);
      const chSnap = await getDoc(chDocRef);
      if (chSnap.exists() && chSnap.data().content) {
        return chSnap.data().content as string[];
      }
    }
    // 2. Check catalog book subcollection
    const catChDocRef = doc(db, 'catalog', bookId, 'chapters', chapterId);
    const catChSnap = await getDoc(catChDocRef);
    if (catChSnap.exists() && catChSnap.data().content) {
      return catChSnap.data().content as string[];
    }
    return null;
  } catch (err) {
    console.warn(`Could not fetch chapter content for ${bookId}/${chapterId}:`, err);
    return null;
  }
}
