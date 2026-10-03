import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuthListener, 
  signInWithGoogle, 
  logOut, 
  syncSavedBookToCloud, 
  removeSavedBookFromCloud, 
  fetchSavedBooksFromCloud, 
  syncAnnotationToCloud, 
  deleteAnnotationFromCloud, 
  fetchAnnotationsFromCloud,
  syncReadingHistoryToCloud,
  removeReadingHistoryFromCloud,
  fetchReadingHistoryFromCloud,
  listenSavedBooks,
  listenAnnotations,
  listenReadingHistory,
  publishSharedHighlightToCloud,
  unpublishSharedHighlightFromCloud,
  listenSharedHighlights,
  toggleLikeSharedHighlightInCloud,
  syncReadingGoalToCloud,
  fetchReadingGoalFromCloud,
  syncDailyReadingLogsToCloud,
  fetchDailyReadingLogsFromCloud,
  // Security Week 1 — new syncs
  fetchSubscriptionFromCloud,
  listenSubscription,
  syncCustomBookToCloud,
  deleteCustomBookFromCloud,
  fetchCustomBooksFromCloud,
  syncCatalogBookToCloud,
  deleteCatalogBookFromCloud,
  fetchCatalogBooksFromCloud,
  listenCatalogBooks,
} from '../lib/firebase';
import { 
  Annotation, 
  Book, 
  CloudSyncStatus, 
  ReadingGoal, 
  ReadingStats, 
  SavedBook, 
  SharedHighlight,
  SubscriptionInfo
} from '../types';
import { BOOKS_DATA, LEGACY_SAMPLE_BOOK_IDS } from '../data/books';
import { 
  computeGoalProgress, 
  GoalProgressSummary, 
  getLocalDateString
} from '../utils/readingGoalUtils';
import { documentBookStore, migrateLegacyBooks } from '../lib/documentBookStore';
import { deleteDocumentAssetsForBook } from '../lib/documentAssetStore';
import { hasActiveSubscription } from '../utils/subscriptionUtils';
import { recordCompletedBook } from '../utils/readingCompletion';
import { exportBookAssets, restoreBookAssets } from '../lib/documentBackup';
import { validateReaderBackup } from '../lib/readerBackupValidation';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  syncStatus: CloudSyncStatus;
  lastSyncedAt: string | null;
  syncNow: () => Promise<void>;
  savedBooks: SavedBook[];
  annotations: Annotation[];
  readingHistory: SavedBook[];
  readingStats: ReadingStats;
  communityHighlights: SharedHighlight[];
  readingGoal: ReadingGoal;
  dailyReadingLogs: Record<string, number>;
  goalProgress: GoalProgressSummary;
  setReadingGoalConfig: (goal: Partial<ReadingGoal>) => Promise<void>;
  recordReadingMinutes: (minutes: number, customDate?: string) => Promise<void>;
  setDayReadingMinutes: (minutes: number, dateStr: string) => Promise<void>;
  resetReadingGoalProgress: () => void;
  getSharedHighlightsForBook: (bookId: string) => SharedHighlight[];
  likeSharedHighlight: (bookId: string, highlightId: string) => Promise<void>;
  toggleShareAnnotation: (annotationId: string, isAnonymous?: boolean) => Promise<boolean>;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  toggleSaveBook: (book: Book) => Promise<boolean>;
  isBookSaved: (bookId: string) => boolean;
  saveAnnotation: (ann: Omit<Annotation, 'id' | 'userId' | 'createdAt'>) => Promise<Annotation>;
  deleteAnnotation: (id: string) => Promise<void>;
  updateBookProgress: (book: Book, chapterId: string, chapterTitle: string, progress: number) => Promise<void>;
  removeHistoryItem: (bookId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  clearStats: () => void;
  exportBackup: () => Promise<string>;
  importBackup: (jsonStr: string) => Promise<boolean>;
  localPersistenceError: string | null;

  // Subscription / Monetization
  subscription: SubscriptionInfo;
  isVip: boolean;

  // Customer Personal Uploads
  customBooks: Book[];
  addCustomBook: (book: Book) => Promise<void>;
  deleteCustomBook: (bookId: string) => Promise<void>;
  canUploadMoreCustomBooks: boolean;
  maxFreeUploads: number;

  // Admin / Owner Catalog Management
  catalogBooks: Book[];
  allCatalogBooks: Book[];
  addCatalogBook: (book: Book) => Promise<void>;
  deleteCatalogBook: (bookId: string) => Promise<void>;
  updateCatalogBook: (book: Book) => Promise<void>;
  isAdminMode: boolean; // Computed from VITE_ADMIN_UIDS env — cannot be toggled by user
}

const LOCAL_STORAGE_SAVED = 'f15_saved_books';
const LOCAL_STORAGE_ANN = 'f15_annotations';
const LOCAL_STORAGE_COMMUNITY = 'f15_community_highlights';
const LOCAL_STORAGE_HISTORY = 'f15_reading_history';
const LOCAL_STORAGE_STATS = 'f15_reading_stats';
const LOCAL_STORAGE_SYNC_TIME = 'f15_last_synced';
const LOCAL_STORAGE_GOAL = 'f15_reading_goal';
const LOCAL_STORAGE_DAILY_LOGS = 'f15_reading_daily_logs';
const LOCAL_STORAGE_CUSTOM_BOOKS = 'f15_custom_books';
const LOCAL_STORAGE_CATALOG_BOOKS = 'f15_catalog_books';
const FREE_SUBSCRIPTION: SubscriptionInfo = { tier: 'free', isActive: false };
const personalScope = (uid?: string) => `personal:${uid || 'guest'}`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [syncStatus, setSyncStatus] = useState<CloudSyncStatus>('local_only');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(LOCAL_STORAGE_SYNC_TIME);
  });

  // Subscription / Monetization state
  const [subscription, setSubscription] = useState<SubscriptionInfo>(FREE_SUBSCRIPTION);
  const [subscriptionOwner, setSubscriptionOwner] = useState<string | null>(null);
  const [subscriptionClock, setSubscriptionClock] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setSubscriptionClock(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const isVip = useMemo(() => {
    return !!user && subscriptionOwner === user.uid && hasActiveSubscription(subscription, subscriptionClock);
  }, [subscription, subscriptionOwner, user, subscriptionClock]);

  // Customer Personal Uploads state
  const [customBooks, setCustomBooks] = useState<Book[]>([]);

  // Admin / Owner Catalog Uploads state
  const [catalogBooks, setCatalogBooks] = useState<Book[]>([]);
  const [localPersistenceError, setLocalPersistenceError] = useState<string | null>(null);
  const libraryReady = useRef<Promise<void> | null>(null);
  useEffect(() => {
    let active = true;
    libraryReady.current = Promise.all([
      migrateLegacyBooks(documentBookStore, personalScope(), localStorage, LOCAL_STORAGE_CUSTOM_BOOKS),
      migrateLegacyBooks(documentBookStore, 'catalog', localStorage, LOCAL_STORAGE_CATALOG_BOOKS),
    ]).then(([personal, catalog]) => {
      if (!active) return;
      setCustomBooks(personal);
      setCatalogBooks(catalog);
    });
    void libraryReady.current.catch(() => {
      if (active) setLocalPersistenceError('Penyimpanan buku tidak dapat dibuka. Data lama tetap disimpan; periksa ruang penyimpanan browser.');
    });
    return () => { active = false; };
  }, []);

  // Admin mode: computed from VITE_ADMIN_UIDS env var — NOT stored in localStorage
  // Security: user cannot manipulate this via DevTools / localStorage
  const ADMIN_UIDS = useMemo(() => {
    const raw = import.meta.env.VITE_ADMIN_UIDS || '';
    return raw.split(',').map((uid: string) => uid.trim()).filter(Boolean);
  }, []);

  const isAdminMode = useMemo(() => {
    if (!user?.uid) return false;
    return ADMIN_UIDS.includes(user.uid);
  }, [user?.uid, ADMIN_UIDS]);

  const allCatalogBooks = useMemo(() => {
    const map = new Map<string, Book>();
    BOOKS_DATA.forEach(b => map.set(b.id, b));
    catalogBooks.forEach(b => map.set(b.id, b));
    return Array.from(map.values());
  }, [catalogBooks]);

  const maxFreeUploads = 1;
  const canUploadMoreCustomBooks = isVip || customBooks.length < maxFreeUploads;

  const addCustomBook = async (book: Book) => {
    await libraryReady.current;
    await documentBookStore.save(personalScope(user?.uid), book);
    setCustomBooks(prev => {
      const next = [book, ...prev.filter(b => b.id !== book.id)];
      return next;
    });
    // Sync to Firestore (cross-device with subcollection chapters)
    if (user) {
      syncCustomBookToCloud(user.uid, book).catch(err => {
        console.warn('Could not sync custom book to cloud:', err);
        setSyncStatus('error');
      });
    }
  };

  const deleteCustomBook = async (bookId: string) => {
    await libraryReady.current;
    if (user) await deleteCustomBookFromCloud(user.uid, bookId);
    await deleteDocumentAssetsForBook(bookId);
    await documentBookStore.remove(personalScope(user?.uid), bookId);
    setCustomBooks(prev => {
      const next = prev.filter(b => b.id !== bookId);
      return next;
    });
  };

  const addCatalogBook = async (book: Book) => {
    if (!isAdminMode) throw new Error('Hanya admin yang dapat mengubah katalog.');
    await libraryReady.current;
    await syncCatalogBookToCloud(book);
    await documentBookStore.save('catalog', book);
    setCatalogBooks(prev => {
      const next = [book, ...prev.filter(b => b.id !== book.id)];
      return next;
    });
  };

  const deleteCatalogBook = async (bookId: string) => {
    if (!isAdminMode) throw new Error('Hanya admin yang dapat mengubah katalog.');
    await libraryReady.current;
    await deleteCatalogBookFromCloud(bookId);
    await deleteDocumentAssetsForBook(bookId);
    await documentBookStore.remove('catalog', bookId);
    setCatalogBooks(prev => {
      const next = prev.filter(b => b.id !== bookId);
      return next;
    });
  };

  const updateCatalogBook = async (book: Book) => {
    if (!isAdminMode) throw new Error('Hanya admin yang dapat mengubah katalog.');
    await libraryReady.current;
    await syncCatalogBookToCloud(book);
    await documentBookStore.save('catalog', book);
    setCatalogBooks(prev => {
      const next = prev.map(b => b.id === book.id ? book : b);
      return next;
    });
  };

  // Local & Cloud states
  const [savedBooks, setSavedBooks] = useState<SavedBook[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVED);
      return saved ? (JSON.parse(saved) as SavedBook[]).filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)) : [];
    } catch {
      return [];
    }
  });

  const [annotations, setAnnotations] = useState<Annotation[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ANN);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [communityHighlights, setCommunityHighlights] = useState<SharedHighlight[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_COMMUNITY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed.filter((item: SharedHighlight) => !item.id.startsWith('comm-'));
      }
      return [];
    } catch {
      return [];
    }
  });

  const [readingHistory, setReadingHistory] = useState<SavedBook[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY);
      if (saved) return (JSON.parse(saved) as SavedBook[]).filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId));
      return [];
    } catch {
      return [];
    }
  });

  const [completedCount, setCompletedCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_STATS);
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const completedBookIds = useRef(new Set<string>(readingHistory.filter(book => book.completed).map(book => book.bookId)));
  const restoredCompletionIds = useRef(false);
  useEffect(() => {
    if (!restoredCompletionIds.current) {
      try {
        const ids: unknown = JSON.parse(localStorage.getItem('f15_completed_book_ids') || '[]');
        if (Array.isArray(ids)) ids.filter(id => typeof id === 'string').forEach(id => completedBookIds.current.add(id));
      } catch { /* Keep the completion ids recovered from reading history. */ }
      restoredCompletionIds.current = true;
    }
    readingHistory.filter(book => book.completed).forEach(book => completedBookIds.current.add(book.bookId));
    localStorage.setItem('f15_completed_book_ids', JSON.stringify([...completedBookIds.current]));
  }, [readingHistory]);

  // Calculate stats
  const readingStats: ReadingStats = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    readingHistory.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });
    let favoriteTopic = 'Future & Innovation';
    let max = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > max) {
        max = count;
        favoriteTopic = cat;
      }
    });

    const joinedDate = user?.metadata?.creationTime
      ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      : 'September 2026';

    return {
      completedCount,
      totalNotesCount: annotations.length,
      favoriteTopic,
      joinedDate
    };
  }, [completedCount, annotations.length, readingHistory, user]);

  // Reading Goal State (Daily or Weekly target minutes)
  const [readingGoal, setReadingGoal] = useState<ReadingGoal>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_GOAL);
      if (saved) return JSON.parse(saved);
      return {
        targetMinutesPerDay: 15,
        mode: 'daily',
        weeklyTargetDays: 7
      };
    } catch {
      return {
        targetMinutesPerDay: 15,
        mode: 'daily',
        weeklyTargetDays: 7
      };
    }
  });

  // Daily Reading Logs Map: { "YYYY-MM-DD": minutesRead }
  const [dailyReadingLogs, setDailyReadingLogs] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DAILY_LOGS);
      if (saved) return JSON.parse(saved);
      return {};
    } catch {
      return {};
    }
  });

  // Compute live progress summary (daily and weekly)
  const goalProgress = useMemo(() => {
    return computeGoalProgress(readingGoal, dailyReadingLogs);
  }, [readingGoal, dailyReadingLogs]);

  // Always-fresh snapshot of state that long-lived closures (event listeners,
  // effects with narrow dep arrays) need to read without going stale.
  const latestStateRef = useRef({
    user, savedBooks, annotations, readingHistory, readingGoal, dailyReadingLogs, customBooks
  });
  latestStateRef.current = {
    user, savedBooks, annotations, readingHistory, readingGoal, dailyReadingLogs, customBooks
  };

  // Sync reading goals and daily logs to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_GOAL, JSON.stringify(readingGoal));
  }, [readingGoal]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_DAILY_LOGS, JSON.stringify(dailyReadingLogs));
  }, [dailyReadingLogs]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_SAVED, JSON.stringify(savedBooks));
  }, [savedBooks]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ANN, JSON.stringify(annotations));
  }, [annotations]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_COMMUNITY, JSON.stringify(communityHighlights));
  }, [communityHighlights]);

  // Listen to Firestore shared highlights across featured library books (scoped to top featured books to optimize connections)
  useEffect(() => {
    const unsubscribers: (() => void)[] = [];
    const featuredBooks = BOOKS_DATA.slice(0, 6);
    featuredBooks.forEach(book => {
      const unsub = listenSharedHighlights(book.id, (cloudHighlights) => {
        if (cloudHighlights && cloudHighlights.length > 0) {
          setCommunityHighlights(prev => {
            const map = new Map<string, SharedHighlight>();
            // Retain existing
            prev.forEach(item => map.set(item.id, item));
            // Update with cloud items
            cloudHighlights.forEach(item => map.set(item.id, item));
            return Array.from(map.values());
          });
        }
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(u => u());
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_HISTORY, JSON.stringify(readingHistory));
  }, [readingHistory]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_STATS, completedCount.toString());
  }, [completedCount]);

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      if (user) {
        setSyncStatus('syncing');
        syncNow();
      } else {
        setSyncStatus('local_only');
      }
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Real-time Cloud Sync & Auth Listener
  useEffect(() => {
    let unsubs: (() => void)[] = [];
    let generation = 0;

    const unsubscribeAuth = initAuthListener(
      async (authUser, token) => {
        const currentGeneration = ++generation;
        const isCurrent = () => generation === currentGeneration;
        setUser(authUser);
        setSubscription(FREE_SUBSCRIPTION);
        setSubscriptionOwner(null);
        setCustomBooks([]);
        setAccessToken(token);
        setIsLoading(true);

        // Clean up previous listeners
        unsubs.forEach(u => u());
        unsubs = [];

        if (authUser) {
          setSyncStatus('syncing');

          try {
            await libraryReady.current;
            const localCustomBooks = await documentBookStore.getAll(personalScope(authUser.uid));
            if (!isCurrent()) return;
            setCustomBooks(localCustomBooks);
            setIsLoading(false);
            // Initial hydration — fetch from Firestore in parallel
            const [
              cloudBooks, cloudAnn, cloudHist, cloudGoal, cloudLogs,
              cloudSubscription, cloudCustomBooks, cloudCatalogBooks
            ] = await Promise.all([
              fetchSavedBooksFromCloud(authUser.uid),
              fetchAnnotationsFromCloud(authUser.uid),
              fetchReadingHistoryFromCloud(authUser.uid),
              fetchReadingGoalFromCloud(authUser.uid),
              fetchDailyReadingLogsFromCloud(authUser.uid),
              // Security Week 1 — fetch from Firestore (overrides localStorage)
              fetchSubscriptionFromCloud(authUser.uid),
              fetchCustomBooksFromCloud(authUser.uid),
              fetchCatalogBooksFromCloud(),
            ]);
            if (!isCurrent()) return;

            // Merge Saved Books
            if (cloudBooks.length > 0) {
              setSavedBooks(cloudBooks.filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
            } else if (savedBooks.length > 0) {
              for (const b of savedBooks) {
                await syncSavedBookToCloud(authUser.uid, b);
              }
            }

            // Merge Annotations
            if (cloudAnn.length > 0) {
              setAnnotations(cloudAnn);
            } else if (annotations.length > 0) {
              for (const a of annotations) {
                await syncAnnotationToCloud(authUser.uid, a);
              }
            }

            // Merge Reading History / Progress
            if (cloudHist.length > 0) {
              setReadingHistory(cloudHist.filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
            } else if (readingHistory.length > 0) {
              for (const h of readingHistory) {
                await syncReadingHistoryToCloud(authUser.uid, h);
              }
            }

            // Merge Reading Goal
            if (cloudGoal) {
              setReadingGoal(cloudGoal);
            } else {
              await syncReadingGoalToCloud(authUser.uid, readingGoal);
            }

            // Merge Daily Reading Logs
            if (cloudLogs && Object.keys(cloudLogs).length > 0) {
              setDailyReadingLogs(prev => ({ ...prev, ...cloudLogs }));
            } else {
              await syncDailyReadingLogsToCloud(authUser.uid, dailyReadingLogs);
            }

            // Security Week 1 — Firestore is source of truth for subscription
            // Override localStorage if Firestore has data (prevents local manipulation)
            if (!isCurrent()) return;
            setSubscription(cloudSubscription || FREE_SUBSCRIPTION);
            setSubscriptionOwner(authUser.uid);

            // Restore custom books from cloud (cross-device)
            if (cloudCustomBooks.length > 0) {
              await Promise.all(cloudCustomBooks.map(book => documentBookStore.save(personalScope(authUser.uid), book)));
              if (!isCurrent()) return;
              setCustomBooks(prev => {
                // Merge: cloud takes priority, keep local-only ones not in cloud
                const cloudIds = new Set(cloudCustomBooks.map(b => b.id));
                const localOnly = prev.filter(b => !cloudIds.has(b.id));
                const merged = [...cloudCustomBooks, ...localOnly];
                return merged;
              });
            }

            // Restore admin-added catalog books from cloud
            if (cloudCatalogBooks.length > 0) {
              await documentBookStore.replace('catalog', cloudCatalogBooks);
              if (!isCurrent()) return;
              setCatalogBooks(cloudCatalogBooks);
            }

            const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            setLastSyncedAt(`Hari ini, ${nowStr}`);
            localStorage.setItem(LOCAL_STORAGE_SYNC_TIME, `Hari ini, ${nowStr}`);
            setSyncStatus('synced');

            // Attach real-time listeners for live cross-device updates
            const unsubBooks = listenSavedBooks(authUser.uid, (books) => {
              if (!isCurrent()) return;
              setSavedBooks((books || []).filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
            });

            const unsubAnn = listenAnnotations(authUser.uid, (anns) => {
              if (!isCurrent()) return;
              setAnnotations(anns || []);
            });

            const unsubHist = listenReadingHistory(authUser.uid, (hist) => {
              if (!isCurrent()) return;
              setReadingHistory((hist || []).filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
            });

            // Real-time subscription listener — catches payment webhooks or admin changes
            const unsubSub = listenSubscription(authUser.uid, (sub) => {
              if (!isCurrent()) return;
              setSubscription(sub || FREE_SUBSCRIPTION);
              setSubscriptionOwner(authUser.uid);
            });

            // Real-time catalog listener — all users see catalog updates instantly
            const unsubCatalog = listenCatalogBooks((books) => {
              if (!isCurrent()) return;
              setCatalogBooks(books);
              void documentBookStore.replace('catalog', books).catch(() => {
                setLocalPersistenceError('Katalog belum tersimpan offline. Periksa ruang penyimpanan browser.');
              });
            });

            unsubs = [unsubBooks, unsubAnn, unsubHist, unsubSub, unsubCatalog];
          } catch (e) {
            if (!isCurrent()) return;
            console.error('Error syncing with cloud library:', e);
            setIsLoading(false);
            setSyncStatus('error');
          }
        } else {
          try {
            await libraryReady.current;
            const guestBooks = await documentBookStore.getAll(personalScope());
            if (!isCurrent()) return;
            setCustomBooks(guestBooks);
            setIsLoading(false);
          } catch {
            if (isCurrent()) {
              setIsLoading(false);
              setLocalPersistenceError('Buku lokal belum dapat dimuat. Data lama tetap disimpan.');
            }
          }
          setSyncStatus('local_only');
        }
      },
      () => {
        generation++;
        setUser(null);
        setSubscription(FREE_SUBSCRIPTION);
        setSubscriptionOwner(null);
        setAccessToken(null);
        setIsLoading(false);
        setSyncStatus('local_only');
      }
    );

    return () => {
      generation++;
      unsubscribeAuth();
      unsubs.forEach(u => u());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Manual Trigger: Sync Now
  const syncNow = async () => {
    const latest = latestStateRef.current;
    const currentUser = latest.user;
    if (!currentUser) {
      await signIn();
      return;
    }

    setSyncStatus('syncing');
    try {
      // Push local items to cloud
      await Promise.all([
        ...latest.savedBooks.map(b => syncSavedBookToCloud(currentUser.uid, b)),
        ...latest.annotations.map(a => syncAnnotationToCloud(currentUser.uid, a)),
        ...latest.readingHistory.map(h => syncReadingHistoryToCloud(currentUser.uid, h)),
        syncReadingGoalToCloud(currentUser.uid, latest.readingGoal),
        syncDailyReadingLogsToCloud(currentUser.uid, latest.dailyReadingLogs),
        ...latest.customBooks.map(book => syncCustomBookToCloud(currentUser.uid, book))
      ]);

      // Pull latest from cloud
      const [cloudBooks, cloudAnn, cloudHist, cloudGoal, cloudLogs, cloudCustomBooks] = await Promise.all([
        fetchSavedBooksFromCloud(currentUser.uid),
        fetchAnnotationsFromCloud(currentUser.uid),
        fetchReadingHistoryFromCloud(currentUser.uid),
        fetchReadingGoalFromCloud(currentUser.uid),
        fetchDailyReadingLogsFromCloud(currentUser.uid),
        fetchCustomBooksFromCloud(currentUser.uid)
      ]);
      if (latestStateRef.current.user?.uid !== currentUser.uid) return;
      await Promise.all(cloudCustomBooks.map(book => documentBookStore.save(personalScope(currentUser.uid), book)));
      setCustomBooks(await documentBookStore.getAll(personalScope(currentUser.uid)));

      setSavedBooks(cloudBooks.filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
      setAnnotations(cloudAnn);
      setReadingHistory(cloudHist.filter(b => !LEGACY_SAMPLE_BOOK_IDS.has(b.bookId)));
      if (cloudGoal) setReadingGoal(cloudGoal);
      if (cloudLogs && Object.keys(cloudLogs).length > 0) setDailyReadingLogs(cloudLogs);

      const nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(`Hari ini, ${nowStr}`);
      localStorage.setItem(LOCAL_STORAGE_SYNC_TIME, `Hari ini, ${nowStr}`);
      setSyncStatus('synced');
    } catch (err) {
      console.error('Manual sync failed:', err);
      setSyncStatus('error');
    }
  };

  const signIn = async () => {
    try {
      const res = await signInWithGoogle();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
      }
    } catch (e) {
      console.error('Sign in failed:', e);
      throw e;
    }
  };

  const signOutUser = async () => {
    await logOut();
    setUser(null);
    setSubscription(FREE_SUBSCRIPTION);
    setSubscriptionOwner(null);
    setAccessToken(null);
    setSyncStatus('local_only');
  };

  const isBookSaved = (bookId: string): boolean => {
    return savedBooks.some(b => b.bookId === bookId);
  };

  const toggleSaveBook = async (book: Book): Promise<boolean> => {
    const exists = savedBooks.some(b => b.bookId === book.id);
    if (exists) {
      setSavedBooks(prev => prev.filter(b => b.bookId !== book.id));
      if (user) {
        setSyncStatus('syncing');
        await removeSavedBookFromCloud(user.uid, book.id);
        setSyncStatus('synced');
      }
      return false;
    } else {
      const newSaved: SavedBook = {
        bookId: book.id,
        title: book.title,
        author: book.author,
        category: book.category,
        progress: 0,
        currentChapterId: book.chapters[0]?.id || 'ch-1',
        currentChapterTitle: book.chapters[0]?.title || 'Bab 1',
        completed: false,
        savedAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString()
      };
      setSavedBooks(prev => [newSaved, ...prev]);
      if (user) {
        setSyncStatus('syncing');
        await syncSavedBookToCloud(user.uid, newSaved);
        setSyncStatus('synced');
      }
      return true;
    }
  };

  const saveAnnotation = async (
    ann: Omit<Annotation, 'id' | 'userId' | 'createdAt'>
  ): Promise<Annotation> => {
    const newAnn: Annotation = {
      ...ann,
      id: 'ann-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      userId: user?.uid || 'guest',
      createdAt: new Date().toISOString(),
      isShared: !!ann.isShared,
      isAnonymous: !!ann.isAnonymous
    };

    setAnnotations(prev => [newAnn, ...prev]);

    if (user) {
      setSyncStatus('syncing');
      await syncAnnotationToCloud(user.uid, newAnn);
      setSyncStatus('synced');
    }

    // Opt-in sharing: If the user explicitly enabled sharing to the community feed
    if (newAnn.isShared) {
      const sharedItem: SharedHighlight = {
        id: newAnn.id,
        bookId: newAnn.bookId,
        bookTitle: newAnn.bookTitle,
        chapterId: newAnn.chapterId,
        chapterTitle: newAnn.chapterTitle,
        selectedText: newAnn.selectedText,
        note: newAnn.note,
        color: newAnn.color,
        userId: user?.uid || 'guest',
        userDisplayName: newAnn.isAnonymous ? 'Pembaca Anonim' : (user?.displayName || 'Pembaca F15'),
        userPhotoURL: newAnn.isAnonymous ? undefined : (user?.photoURL || undefined),
        isAnonymous: !!newAnn.isAnonymous,
        likesCount: 0,
        likedBy: [],
        createdAt: newAnn.createdAt
      };

      setCommunityHighlights(prev => [sharedItem, ...prev.filter(h => h.id !== sharedItem.id)]);

      if (user) {
        publishSharedHighlightToCloud(sharedItem).catch(err => {
          console.warn('Could not sync shared highlight to cloud:', err);
        });
      }
    }

    return newAnn;
  };

  const deleteAnnotation = async (id: string): Promise<void> => {
    const target = annotations.find(a => a.id === id);
    setAnnotations(prev => prev.filter(a => a.id !== id));

    if (target?.isShared) {
      setCommunityHighlights(prev => prev.filter(h => h.id !== id));
      if (user) {
        unpublishSharedHighlightFromCloud(target.bookId, id).catch(err => {
          console.warn('Could not remove shared highlight from cloud:', err);
        });
      }
    }

    if (user) {
      setSyncStatus('syncing');
      await deleteAnnotationFromCloud(user.uid, id);
      setSyncStatus('synced');
    }
  };

  const toggleShareAnnotation = async (
    annotationId: string, 
    isAnonymous?: boolean
  ): Promise<boolean> => {
    const target = annotations.find(a => a.id === annotationId);
    if (!target) return false;

    const willShare = !target.isShared;
    const anonSetting = isAnonymous !== undefined ? isAnonymous : !!target.isAnonymous;

    const updatedAnn: Annotation = {
      ...target,
      isShared: willShare,
      isAnonymous: anonSetting
    };

    setAnnotations(prev => prev.map(a => a.id === annotationId ? updatedAnn : a));

    if (willShare) {
      const sharedItem: SharedHighlight = {
        id: updatedAnn.id,
        bookId: updatedAnn.bookId,
        bookTitle: updatedAnn.bookTitle,
        chapterId: updatedAnn.chapterId,
        chapterTitle: updatedAnn.chapterTitle,
        selectedText: updatedAnn.selectedText,
        note: updatedAnn.note,
        color: updatedAnn.color,
        userId: user?.uid || 'guest',
        userDisplayName: anonSetting ? 'Pembaca Anonim' : (user?.displayName || 'Pembaca F15'),
        userPhotoURL: anonSetting ? undefined : (user?.photoURL || undefined),
        isAnonymous: anonSetting,
        likesCount: 0,
        likedBy: [],
        createdAt: updatedAnn.createdAt
      };

      setCommunityHighlights(prev => [sharedItem, ...prev.filter(h => h.id !== sharedItem.id)]);

      if (user) {
        publishSharedHighlightToCloud(sharedItem).catch(err => {
          console.warn('Could not publish shared highlight to cloud:', err);
        });
      }
    } else {
      setCommunityHighlights(prev => prev.filter(h => h.id !== annotationId));
      if (user) {
        unpublishSharedHighlightFromCloud(target.bookId, annotationId).catch(err => {
          console.warn('Could not unpublish shared highlight from cloud:', err);
        });
      }
    }

    if (user) {
      syncAnnotationToCloud(user.uid, updatedAnn).catch(err => {
        console.warn('Could not sync updated annotation to cloud:', err);
      });
    }

    return willShare;
  };

  const getSharedHighlightsForBook = (bookId: string): SharedHighlight[] => {
    return communityHighlights.filter(h => h.bookId === bookId);
  };

  const likeSharedHighlight = async (bookId: string, highlightId: string) => {
    // Firestore rules require an authenticated caller to toggle a like, so a
    // guest "like" can never actually persist — it would look like it worked
    // for a moment, then silently revert on the next real-time snapshot from
    // Firestore. Ask guests to sign in instead of faking it.
    if (!user) {
      await signIn();
      return;
    }

    const currentUserId = user.uid;

    setCommunityHighlights(prev => prev.map(item => {
      if (item.id === highlightId) {
        const likedByList = item.likedBy || [];
        const isLiked = likedByList.includes(currentUserId);
        const updatedList = isLiked
          ? likedByList.filter(id => id !== currentUserId)
          : [...likedByList, currentUserId];

        return {
          ...item,
          likedBy: updatedList,
          likesCount: updatedList.length
        };
      }
      return item;
    }));

    try {
      await toggleLikeSharedHighlightInCloud(bookId, highlightId, currentUserId);
    } catch (err) {
      console.warn('Could not sync like to cloud:', err);
    }
  };

  const updateBookProgress = async (
    book: Book,
    chapterId: string,
    chapterTitle: string,
    progress: number
  ) => {
    const isCompleted = progress >= 100;
    const nowIso = new Date().toISOString();

    const updatedItem: SavedBook = {
      bookId: book.id,
      title: book.title,
      author: book.author,
      category: book.category,
      progress,
      currentChapterId: chapterId,
      currentChapterTitle: chapterTitle,
      completed: isCompleted,
      savedAt: nowIso,
      lastReadAt: nowIso
    };

    // Update reading history
    setReadingHistory(prev => {
      const filtered = prev.filter(b => b.bookId !== book.id);
      return [updatedItem, ...filtered];
    });

    // Also update saved book if it is bookmarked
    setSavedBooks(prev =>
      prev.map(b => {
        if (b.bookId === book.id) {
          return {
            ...b,
            progress,
            currentChapterId: chapterId,
            currentChapterTitle: chapterTitle,
            completed: isCompleted,
            lastReadAt: nowIso
          };
        }
        return b;
      })
    );

    // Sync progress to cloud library
    if (user) {
      syncReadingHistoryToCloud(user.uid, updatedItem);
      const isSaved = savedBooks.some(b => b.bookId === book.id);
      if (isSaved) {
        syncSavedBookToCloud(user.uid, updatedItem);
      }
    }

    if (recordCompletedBook(completedBookIds.current, book.id, progress)) {
      setCompletedCount(prev => prev + 1);
      localStorage.setItem('f15_completed_book_ids', JSON.stringify([...completedBookIds.current]));
    }
  };

  const removeHistoryItem = async (bookId: string) => {
    setReadingHistory(prev => prev.filter(b => b.bookId !== bookId));
    if (user) {
      await removeReadingHistoryFromCloud(user.uid, bookId);
    }
  };

  const clearHistory = async () => {
    if (user) {
      await Promise.all(
        readingHistory.map(h => removeReadingHistoryFromCloud(user.uid, h.bookId))
      );
    }
    setReadingHistory([]);
  };

  const clearStats = () => {
    setCompletedCount(0);
    completedBookIds.current = new Set(readingHistory.filter(book => book.completed).map(book => book.bookId));
    localStorage.setItem('f15_completed_book_ids', JSON.stringify([...completedBookIds.current]));
  };

  const setReadingGoalConfig = async (newGoal: Partial<ReadingGoal>) => {
    const updated: ReadingGoal = {
      ...readingGoal,
      ...newGoal
    };
    setReadingGoal(updated);
    if (user) {
      syncReadingGoalToCloud(user.uid, updated).catch(err => {
        console.warn('Could not sync reading goal to cloud:', err);
      });
    }
  };

  const recordReadingMinutes = async (minutes: number, customDate?: string) => {
    if (minutes <= 0) return;
    const targetDate = customDate || getLocalDateString();
    
    setDailyReadingLogs(prev => {
      const current = prev[targetDate] || 0;
      const updated = {
        ...prev,
        [targetDate]: current + minutes
      };
      if (user) {
        syncDailyReadingLogsToCloud(user.uid, updated).catch(err => {
          console.warn('Could not sync daily logs to cloud:', err);
        });
      }
      return updated;
    });
  };

  const setDayReadingMinutes = async (minutes: number, dateStr: string) => {
    const safeMinutes = Math.max(0, minutes);
    setDailyReadingLogs(prev => {
      const updated = {
        ...prev,
        [dateStr]: safeMinutes
      };
      if (user) {
        syncDailyReadingLogsToCloud(user.uid, updated).catch(err => {
          console.warn('Could not sync daily logs to cloud:', err);
        });
      }
      return updated;
    });
  };

  const resetReadingGoalProgress = () => {
    const freshLogs: Record<string, number> = {
      [getLocalDateString()]: 0
    };
    setDailyReadingLogs(freshLogs);
    if (user) {
      syncDailyReadingLogsToCloud(user.uid, freshLogs).catch(err => {
        console.warn('Could not reset logs in cloud:', err);
      });
    }
  };

  const exportBackup = async (): Promise<string> => {
    await libraryReady.current;
    const documentAssets = await exportBookAssets(customBooks);
    const backupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      savedBooks,
      annotations,
      readingHistory,
      completedCount,
      readingGoal,
      dailyReadingLogs,
      customBooks,
      documentAssets,
      completedBookIds: [...completedBookIds.current]
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackup = async (jsonStr: string): Promise<boolean> => {
    try {
      await libraryReady.current;
      const data = JSON.parse(jsonStr);
      if (!validateReaderBackup(data)) return false;
      if (data.customBooks !== undefined) {
        // Legacy backups contain no image bytes. Refuse silent image loss.
        await restoreBookAssets(data.customBooks, data.documentAssets || []);
        await documentBookStore.replace(personalScope(user?.uid), data.customBooks);
      }
      if (data && Array.isArray(data.savedBooks)) {
        setSavedBooks(data.savedBooks);
      }
      if (data && Array.isArray(data.annotations)) {
        setAnnotations(data.annotations);
      }
      if (data && Array.isArray(data.readingHistory)) {
        setReadingHistory(data.readingHistory);
      }
      if (data && typeof data.completedCount === 'number') {
        setCompletedCount(data.completedCount);
      }
      if (data && data.readingGoal) {
        setReadingGoal(data.readingGoal);
      }
      if (data && data.dailyReadingLogs) {
        setDailyReadingLogs(data.dailyReadingLogs);
      }
      if (data && Array.isArray(data.customBooks)) {
        setCustomBooks(data.customBooks);
      }
      completedBookIds.current = new Set([
        ...(data.completedBookIds || []),
        ...(data.readingHistory || []).filter((book: SavedBook) => book.completed).map((book: SavedBook) => book.bookId),
      ]);
      localStorage.setItem('f15_completed_book_ids', JSON.stringify([...completedBookIds.current]));
      return true;
    } catch (e) {
      console.error('Failed to import backup JSON:', e);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        syncStatus,
        lastSyncedAt,
        syncNow,
        savedBooks,
        annotations,
        readingHistory,
        readingStats,
        communityHighlights,
        readingGoal,
        dailyReadingLogs,
        goalProgress,
        setReadingGoalConfig,
        recordReadingMinutes,
        setDayReadingMinutes,
        resetReadingGoalProgress,
        getSharedHighlightsForBook,
        likeSharedHighlight,
        toggleShareAnnotation,
        signIn,
        signOutUser,
        toggleSaveBook,
        isBookSaved,
        saveAnnotation,
        deleteAnnotation,
        updateBookProgress,
        removeHistoryItem,
        clearHistory,
        clearStats,
        exportBackup,
        importBackup,
        subscription,
        isVip,
        localPersistenceError,
        customBooks,
        addCustomBook,
        deleteCustomBook,
        canUploadMoreCustomBooks,
        maxFreeUploads,
        catalogBooks,
        allCatalogBooks,
        addCatalogBook,
        deleteCatalogBook,
        updateCatalogBook,
        isAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
