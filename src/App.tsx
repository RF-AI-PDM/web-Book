import React, { useState, useEffect, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ContinueReadingCard } from './components/ContinueReadingCard';
import { BookOfDayCard } from './components/BookOfDayCard';
import { BookCarousel } from './components/BookCarousel';
import { BookGrid } from './components/BookGrid';
import { SettingsModal } from './components/SettingsModal';
import { Footer } from './components/Footer';

// Lazy-loaded: reader (large) and modals that most sessions never open.
// Keeps them out of the initial bundle instead of shipping every screen
// up front.
const ReaderView = lazy(() => import('./components/ReaderView').then(m => ({ default: m.ReaderView })));
const CollectionsView = lazy(() => import('./components/CollectionsView').then(m => ({ default: m.CollectionsView })));
const MyBooksView = lazy(() => import('./components/MyBooksView').then(m => ({ default: m.MyBooksView })));
const AIMentorModal = lazy(() => import('./components/AIMentorModal').then(m => ({ default: m.AIMentorModal })));
const WorkspaceExportModal = lazy(() => import('./components/WorkspaceExportModal').then(m => ({ default: m.WorkspaceExportModal })));
const SubscriptionModal = lazy(() => import('./components/SubscriptionModal').then(m => ({ default: m.SubscriptionModal })));
const UploadBookModal = lazy(() => import('./components/UploadBookModal').then(m => ({ default: m.UploadBookModal })));
const AdminBookManagerModal = lazy(() => import('./components/AdminBookManagerModal').then(m => ({ default: m.AdminBookManagerModal })));
import { BOOKS_DATA } from './data/books';
import { loadCatalogBook } from './data/loadCatalogBook';
import { Book, Annotation } from './types';
import { 
  getReadingSchedule, 
  saveReadingSchedule, 
  shouldTriggerReminderNow, 
  sendNativePushNotification, 
  playChimeSound 
} from './utils/notificationUtils';
import { Bell, X, BookOpen } from 'lucide-react';

function MainApp() {
  const { 
    readingHistory, 
    saveAnnotation, 
    goalProgress,
    allCatalogBooks,
    customBooks,
    localPersistenceError
  } = useAuth();

  const [currentView, setCurrentView] = useState<'home' | 'collections' | 'my-books' | 'reader'>('home');
  const [activeBook, setActiveBook] = useState<Book | null>(null);
  const [activeChapterId, setActiveChapterId] = useState<string | undefined>(undefined);
  const [openingBookId, setOpeningBookId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [openingSource, setOpeningSource] = useState<{ url: string; fileType?: string } | null>(null);
  const openingRequest = React.useRef(0);

  // Subscription Modal state
  const [subscriptionModalState, setSubscriptionModalState] = useState<{
    isOpen: boolean;
    reason?: string;
  }>({ isOpen: false });

  // Upload Modal state
  const [uploadModalState, setUploadModalState] = useState<{
    isOpen: boolean;
    target: 'personal' | 'catalog';
  }>({ isOpen: false, target: 'personal' });

  // Admin CMS Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Active reading reminder ticker
  const [activeReminderAlert, setActiveReminderAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    const checkSchedule = () => {
      const schedule = getReadingSchedule();
      if (shouldTriggerReminderNow(schedule)) {
        const title = `📖 Waktunya Membaca 15 Menit · Streak ${goalProgress.currentStreak} Hari!`;
        const message = schedule.customMessage || 'Waktunya 15 menit membaca untuk menjaga streak konsistenmu hari ini! 🔥';

        // 1. Play chime sound if enabled
        if (schedule.soundEnabled) {
          playChimeSound('bell');
        }

        // 2. Send native browser push notification
        sendNativePushNotification(title, {
          body: message,
          tag: 'f15-daily-reminder'
        });

        // 3. Trigger in-app floating banner
        setActiveReminderAlert({
          show: true,
          title,
          message
        });

        // 4. Mark today as notified
        const todayIso = new Date().toISOString().slice(0, 10);
        saveReadingSchedule({
          ...schedule,
          lastNotifiedDate: todayIso
        });
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 20000);
    return () => clearInterval(interval);
  }, [goalProgress.currentStreak]);

  // AI Mentor modal state
  const [aiMentorState, setAiMentorState] = useState<{
    isOpen: boolean;
    chapterTitle?: string;
    quote?: string;
  }>({ isOpen: false });

  // Workspace export modal state
  const [workspaceExportState, setWorkspaceExportState] = useState<{
    isOpen: boolean;
    book: Book | null;
    annotation?: Annotation;
  }>({ isOpen: false, book: null });

  // Handle book selection to open Reader
  const handleSelectBook = async (book: Book, chapterId?: string) => {
    const requestId = ++openingRequest.current;
    setOpeningBookId(book.id);
    setOpeningSource(book.sourceUrl ? { url: book.sourceUrl, fileType: book.fileType } : null);
    setOpenError(null);
    try {
      const readableBook = await loadCatalogBook(book);
      if (requestId !== openingRequest.current) return;
      setActiveBook(readableBook);
      setActiveChapterId(chapterId);
      setCurrentView('reader');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (requestId === openingRequest.current) {
        setOpenError(error instanceof Error ? error.message : 'Dokumen gagal dibuka.');
      }
    } finally {
      if (requestId === openingRequest.current) setOpeningBookId(null);
    }
  };

  // Continue reading item (latest read from history)
  const continueReadingItem = readingHistory[0];
  const continueReadingBook = continueReadingItem 
    ? (allCatalogBooks.find(b => b.id === continueReadingItem.bookId) || customBooks.find(b => b.id === continueReadingItem.bookId))
    : undefined;

  const bookOfDay = allCatalogBooks[0] || BOOKS_DATA[0];

  // Recommendations for carousel
  const recommendedBooks = allCatalogBooks.filter(b => b.id !== bookOfDay.id).slice(0, 7);

  // Open Workspace Export modal
  const handleOpenWorkspace = (book: Book, annotation?: Annotation) => {
    setWorkspaceExportState({
      isOpen: true,
      book,
      annotation
    });
  };

  // Open AI Thinking Mentor modal
  const handleOpenAIMentor = (chapterTitle: string, quote?: string) => {
    setAiMentorState({
      isOpen: true,
      chapterTitle,
      quote
    });
  };

  // Books searchable via Navbar search (catalog books + user uploaded custom books)
  const allSearchableBooks = React.useMemo(() => {
    const map = new Map<string, Book>();
    allCatalogBooks.forEach(b => map.set(b.id, b));
    customBooks.forEach(b => map.set(b.id, b));
    return Array.from(map.values());
  }, [allCatalogBooks, customBooks]);

  return (
    <div className="min-h-screen text-zinc-100 flex flex-col justify-between selection:bg-orange-500/30 selection:text-orange-200" style={{ backgroundColor: 'var(--app-bg)', color: 'var(--app-text)' }}>
      {localPersistenceError && <div role="alert" className="border-b border-amber-700 bg-amber-950 px-4 py-3 text-center text-sm text-amber-100">{localPersistenceError}</div>}
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectBook={handleSelectBook}
        allBooks={allSearchableBooks}
        onOpenUploadModal={() => setUploadModalState({ isOpen: true, target: 'personal' })}
        onOpenSubscriptionModal={() => setSubscriptionModalState({ isOpen: true })}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
      />

      {/* Main Content Areas */}
      <main className="flex-1">
        {(openingBookId || openError) && (
          <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)] rounded-xl border border-stone-700 bg-stone-900 p-4 text-sm text-zinc-100 shadow-2xl">
            {openingBookId ? 'Memuat isi dokumen. Buku besar mungkin memerlukan beberapa saat…' : openError}
            {openingSource && (
              <a href={openingSource.url} target={openingSource.fileType === '.pdf' ? '_blank' : undefined} rel="noopener noreferrer" download={openingSource.fileType === '.epub' ? true : undefined} className="ml-3 text-orange-400 underline">
                {openingSource.fileType === '.pdf' ? 'Buka PDF asli' : 'Unduh EPUB asli'}
              </a>
            )}
            {openError && <button className="ml-3 text-orange-400 underline" onClick={() => setOpenError(null)}>Tutup</button>}
          </div>
        )}
        {/* VIEW 1: HOME (BERANDA) */}
        {currentView === 'home' && (
          <div>
            <HeroSection
              onExploreCollections={() => setCurrentView('collections')}
              onOpenMyBooks={() => setCurrentView('my-books')}
              featuredBooks={allCatalogBooks}
              onSelectBook={handleSelectBook}
            />

            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              {/* Lanjut baca section if user has active reading progress */}
              {continueReadingItem && continueReadingBook && (
                <ContinueReadingCard
                  readingItem={continueReadingItem}
                  fullBook={continueReadingBook}
                  onContinue={(bookId, chapterId) => {
                    const b = allCatalogBooks.find(x => x.id === bookId) || customBooks.find(x => x.id === bookId);
                    if (b) handleSelectBook(b, chapterId);
                  }}
                />
              )}

              {/* Buku Hari Ini Spotlight Card */}
              <BookOfDayCard
                book={bookOfDay}
                onRead={handleSelectBook}
              />

              {/* Pilihan katalog (Carousel) */}
              <BookCarousel
                title="Pilihan dari koleksi"
                subtitle="Buku lain yang tersedia dalam format PDF dan EPUB"
                books={recommendedBooks}
                onSelectBook={handleSelectBook}
              />

              {/* Semua buku dalam katalog */}
              <BookGrid
                title="Semua buku"
                subtitle="Jelajahi lima dokumen asli yang tersedia di perpustakaan"
                books={allCatalogBooks}
                onSelectBook={handleSelectBook}
                onViewAll={() => setCurrentView('collections')}
              />
            </div>
          </div>
        )}

        {/* VIEW 2: KOLEKSI (THEMATIC SHELVES) */}
        {currentView === 'collections' && (
          <Suspense fallback={<p role="status" className="p-8 text-center">Memuat koleksi...</p>}>
          <CollectionsView
            books={allCatalogBooks}
            onSelectBook={handleSelectBook}
            onBackToHome={() => setCurrentView('home')}
          />
          </Suspense>
        )}

        {/* VIEW 3: BUKU SAYA (CLOUD LIBRARY & JOURNAL) */}
        {currentView === 'my-books' && (
          <Suspense fallback={<p role="status" className="p-8 text-center">Memuat buku Anda...</p>}>
          <MyBooksView
            allBooks={allCatalogBooks}
            onSelectBook={handleSelectBook}
            onExplore={() => setCurrentView('collections')}
            onExportWorkspace={handleOpenWorkspace}
            onOpenUpload={(target) => setUploadModalState({ isOpen: true, target: target || 'personal' })}
            onOpenSubscription={(reason) => setSubscriptionModalState({ isOpen: true, reason })}
          />
          </Suspense>
        )}

        {/* VIEW 4: DIGITAL BOOK READER */}
        {currentView === 'reader' && activeBook && (
          <Suspense fallback={null}>
            <ReaderView
              book={activeBook}
              initialChapterId={activeChapterId}
              onBack={() => {
                setCurrentView('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenAIMentor={handleOpenAIMentor}
              onOpenWorkspaceExport={handleOpenWorkspace}
              onOpenSubscription={(reason) => setSubscriptionModalState({ isOpen: true, reason })}
            />
          </Suspense>
        )}
      </main>

      {/* Footer */}
      {currentView !== 'reader' && (
        <Footer onNavigate={(v) => setCurrentView(v)} />
      )}

      {/* Settings Modal (Ukuran Teks, Tema, PWA, Google Account) */}
      <SettingsModal />

      {/* AI Mentor Thinking Modal (Gemini 3.1 Pro Thinking Mode) */}
      {aiMentorState.isOpen && activeBook && (
        <Suspense fallback={null}>
          <AIMentorModal
            book={activeBook}
            chapterTitle={aiMentorState.chapterTitle}
            highlightedText={aiMentorState.quote}
            onClose={() => setAiMentorState({ isOpen: false })}
            onSaveAsAnnotation={(note, quote) => {
              saveAnnotation({
                bookId: activeBook.id,
                bookTitle: activeBook.title,
                chapterId: activeChapterId || activeBook.chapters[0].id,
                chapterTitle: aiMentorState.chapterTitle || activeBook.chapters[0].title,
                selectedText: quote,
                color: 'purple',
                note
              });
            }}
          />
        </Suspense>
      )}

      {/* Google Workspace Export Modal (Docs, Sheets, Gmail, Chat with mandatory confirmation) */}
      {workspaceExportState.isOpen && workspaceExportState.book && (
        <Suspense fallback={null}>
          <WorkspaceExportModal
            book={workspaceExportState.book}
            specificAnnotation={workspaceExportState.annotation}
            onClose={() => setWorkspaceExportState({ isOpen: false, book: null })}
          />
        </Suspense>
      )}

      {/* Subscription & VIP Upgrade Modal */}
      {subscriptionModalState.isOpen && (
        <Suspense fallback={null}>
          <SubscriptionModal
            isOpen={subscriptionModalState.isOpen}
            reason={subscriptionModalState.reason}
            onClose={() => setSubscriptionModalState({ isOpen: false })}
          />
        </Suspense>
      )}

      {/* Upload Book Modal (PDF, DOCX, EPUB) */}
      {uploadModalState.isOpen && (
        <Suspense fallback={null}>
          <UploadBookModal
            isOpen={uploadModalState.isOpen}
            target={uploadModalState.target}
            onClose={() => setUploadModalState({ isOpen: false, target: 'personal' })}
            onSelectBook={handleSelectBook}
            onOpenSubscriptionModal={(reason) => setSubscriptionModalState({ isOpen: true, reason })}
          />
        </Suspense>
      )}

      {/* Admin Catalog Manager Modal (CMS) */}
      {isAdminModalOpen && (
        <Suspense fallback={null}>
          <AdminBookManagerModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onOpenUploadCatalog={() => setUploadModalState({ isOpen: true, target: 'catalog' })}
            onSelectBook={handleSelectBook}
          />
        </Suspense>
      )}

      {/* In-App Floating Daily Reading Reminder Toast */}
      {activeReminderAlert?.show && (
        <div className="fixed top-20 right-4 sm:right-8 max-w-sm w-full p-4 rounded-2xl bg-[#181924] border border-orange-500 shadow-2xl z-50 text-zinc-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-100">{activeReminderAlert.title}</h4>
                <p className="text-[11px] text-orange-400 font-medium">Pengingat Membaca Harian F15</p>
              </div>
            </div>
            <button
              onClick={() => setActiveReminderAlert(null)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <p className="text-xs text-zinc-300 mb-3.5 leading-relaxed pl-1">
            {activeReminderAlert.message}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveReminderAlert(null);
                if (continueReadingBook) {
                  handleSelectBook(continueReadingBook, continueReadingItem?.currentChapterId);
                } else {
                  handleSelectBook(bookOfDay);
                }
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
            >
              <BookOpen size={14} />
              <span>Buka Buku Sekarang (15 Mnt)</span>
            </button>
            <button
              onClick={() => setActiveReminderAlert(null)}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-300 text-xs font-medium cursor-pointer transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </AuthProvider>
  );
}
