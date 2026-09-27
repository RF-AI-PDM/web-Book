import React, { useState, useMemo } from 'react';
import { 
  Bookmark, 
  BookOpen, 
  Trash2, 
  Cloud, 
  Download, 
  Upload, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Clock,
  ExternalLink,
  Share2,
  CheckCircle2,
  X,
  Search,
  ArrowUpDown,
  RefreshCw,
  History,
  Check,
  Globe,
  Lock,
  Flame,
  Target,
  Award,
  Bell,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Book, Annotation, SavedBook, BookSortOption } from '../types';
import { BookCover } from './BookCover';
import { ReadingGoalTracker } from './ReadingGoalTracker';
import { ReadingStreakCard } from './ReadingStreakCard';
import { UserBadgesCard } from './UserBadgesCard';
import { ReadingSchedulerCard } from './ReadingSchedulerCard';

interface MyBooksViewProps {
  allBooks: Book[];
  onSelectBook: (book: Book, chapterId?: string) => void;
  onExplore: () => void;
  onExportWorkspace: (book: Book, annotation?: Annotation) => void;
  onOpenUpload?: (target?: 'personal' | 'catalog') => void;
  onOpenSubscription?: (reason?: string) => void;
}

export const MyBooksView: React.FC<MyBooksViewProps> = ({
  allBooks,
  onSelectBook,
  onExplore,
  onExportWorkspace,
  onOpenUpload,
  onOpenSubscription
}) => {
  const { 
    user, 
    signIn, 
    savedBooks, 
    annotations, 
    readingHistory, 
    readingStats, 
    removeHistoryItem, 
    clearHistory, 
    clearStats,
    deleteAnnotation,
    toggleShareAnnotation,
    toggleSaveBook,
    exportBackup,
    importBackup,
    syncStatus,
    lastSyncedAt,
    syncNow,
    goalProgress,
    customBooks,
    deleteCustomBook,
    isVip,
    canUploadMoreCustomBooks,
    maxFreeUploads
  } = useAuth();

  const [trackerTab, setTrackerTab] = useState<'streak' | 'goals' | 'badges' | 'schedule' | 'both'>('streak');
  const [activeTab, setActiveTab] = useState<'saved' | 'history' | 'journal' | 'uploads'>('saved');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<BookSortOption>('recent');
  const [selectedBookFilter, setSelectedBookFilter] = useState<string>('all');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState<boolean>(false);

  // Trigger manual cloud sync
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await syncNow();
    } finally {
      setIsManualSyncing(false);
    }
  };

  // 1. FILTER & SORT SAVED BOOKS
  const filteredAndSortedSavedBooks = useMemo(() => {
    let list = savedBooks.filter(saved => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        saved.title.toLowerCase().includes(q) ||
        saved.author.toLowerCase().includes(q) ||
        saved.category.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'recent':
        default:
          return new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime();
      }
    });

    return list;
  }, [savedBooks, searchQuery, sortBy]);

  // 2. FILTER & SORT READING HISTORY
  const filteredAndSortedHistory = useMemo(() => {
    let list = readingHistory.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      switch (sortBy) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'recent':
        default:
          return new Date(b.lastReadAt || 0).getTime() - new Date(a.lastReadAt || 0).getTime();
      }
    });

    return list;
  }, [readingHistory, searchQuery, sortBy]);

  // 3. FILTER ANNOTATIONS
  const filteredAnnotations = useMemo(() => {
    return annotations.filter(a => {
      const matchesBook = selectedBookFilter === 'all' || a.bookId === selectedBookFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesBook;
      const matchesSearch = 
        a.bookTitle.toLowerCase().includes(q) ||
        a.selectedText.toLowerCase().includes(q) ||
        (a.note && a.note.toLowerCase().includes(q));
      return matchesBook && matchesSearch;
    });
  }, [annotations, selectedBookFilter, searchQuery]);

  // Handle Export Backup JSON
  const handleExportBackup = () => {
    const jsonStr = exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `f15-library-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage('Cadangan berhasil diunduh ke perangkat Anda.');
    setTimeout(() => setBackupMessage(null), 4000);
  };

  // Handle Import Backup JSON
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackup(content);
        if (success) {
          setBackupMessage('Cadangan data berhasil dipulihkan!');
        } else {
          setBackupMessage('Gagal memulihkan file cadangan.');
        }
        setTimeout(() => setBackupMessage(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-stone-800/80">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-100">
          Buku Saya
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Koleksi buku tersimpan, riwayat kemajuan membaca, dan jurnal anotasi yang tersinkronisasi di semua perangkat Anda.
        </p>
      </div>

      {/* Cross-Device Cloud Sync Status Banner */}
      {!user ? (
        <div className="my-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
            <p className="leading-relaxed">
              Daftar buku dan kemajuan membaca ini saat ini tersimpan di peramban lokal. Masuk dengan Google untuk mengaktifkan <strong>sinkronisasi lintas perangkat otomatis</strong> via Cloud Firestore.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#171822] to-[#1a1c29] border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Cloud size={16} className="text-orange-500" />
                <span>Aktifkan Sinkronisasi Lintas Perangkat</span>
              </h4>
              <p className="text-xs text-zinc-400 mt-1">
                Lanjutkan membaca di ponsel, tablet, atau komputer lain tanpa kehilangan halaman terakhir, bookmark, dan sorotan catatan.
              </p>
            </div>
            <button
              onClick={signIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm cursor-pointer"
            >
              <span>Masuk dengan Google</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="my-6 p-4 rounded-2xl bg-[#14151c] border border-stone-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Cloud size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-zinc-200">
                  Sinkronisasi Cloud Firestore Aktif
                </h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check size={11} /> Real-Time
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Terhubung sebagai <span className="text-zinc-200 font-medium">{user.displayName || user.email}</span>. {lastSyncedAt ? `Terakhir disinkronkan: ${lastSyncedAt}` : 'Semua perubahan otomatis tersimpan.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleManualSync}
            disabled={isManualSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-zinc-200 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isManualSyncing || syncStatus === 'syncing' ? 'animate-spin text-orange-400' : 'text-zinc-400'} />
            <span>{isManualSyncing || syncStatus === 'syncing' ? 'Menyinkronkan...' : 'Sinkronkan Sekarang'}</span>
          </button>
        </div>
      )}

      {/* Pelacak Konsistensi: Reading Streak Display & Target Membaca */}
      <div className="my-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-stone-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTrackerTab('streak')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                trackerTab === 'streak'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900 border border-transparent'
              }`}
            >
              <Flame size={14} className={trackerTab === 'streak' ? 'text-amber-400 fill-amber-400' : 'text-zinc-400'} />
              <span>Streak ({goalProgress.currentStreak} Hari)</span>
            </button>

            <button
              onClick={() => setTrackerTab('goals')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                trackerTab === 'goals'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900 border border-transparent'
              }`}
            >
              <Target size={14} className={trackerTab === 'goals' ? 'text-orange-400' : 'text-zinc-400'} />
              <span>Target Menit ({goalProgress.todayMinutes}/{goalProgress.todayTarget}m)</span>
            </button>

            <button
              onClick={() => setTrackerTab('badges')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                trackerTab === 'badges'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900 border border-transparent'
              }`}
            >
              <Award size={14} className={trackerTab === 'badges' ? 'text-indigo-400' : 'text-zinc-400'} />
              <span>Lencana & Milestone</span>
            </button>

            <button
              onClick={() => setTrackerTab('schedule')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                trackerTab === 'schedule'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900 border border-transparent'
              }`}
            >
              <Bell size={14} className={trackerTab === 'schedule' ? 'text-amber-400' : 'text-zinc-400'} />
              <span>Jadwal Pengingat</span>
            </button>
          </div>

          <button
            onClick={() => setTrackerTab(trackerTab === 'both' ? 'streak' : 'both')}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
              trackerTab === 'both'
                ? 'bg-stone-800 border-stone-700 text-orange-300'
                : 'bg-transparent border-stone-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {trackerTab === 'both' ? 'Satu Tampilan Saja' : 'Tampilkan Semua'}
          </button>
        </div>

        {/* 1. Reading Streak Display: Consecutive Days Visualization, 28-day Heatmap, and Milestones */}
        {(trackerTab === 'streak' || trackerTab === 'both') && (
          <ReadingStreakCard onStartReading={onExplore} />
        )}

        {/* 2. Reading Goal Tracker: Daily / Weekly Progress Bars and Loggers */}
        {(trackerTab === 'goals' || trackerTab === 'both') && (
          <ReadingGoalTracker onOpenReader={onExplore} />
        )}

        {/* 3. Badges Component: Unlocked Milestones (Night Owl, Speed Reader, etc.) */}
        {(trackerTab === 'badges' || trackerTab === 'both') && (
          <UserBadgesCard onExplore={onExplore} />
        )}

        {/* 4. Reading Scheduler Component: Daily Push Notifications and Streak Reminders */}
        {(trackerTab === 'schedule' || trackerTab === 'both') && (
          <ReadingSchedulerCard onExplore={onExplore} />
        )}
      </div>

      {/* Perjalanan Baca / Reading Stats */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-2">
            <Sparkles size={14} className="text-orange-500" />
            <span>Perjalanan baca</span>
          </h2>
          <button
            onClick={clearStats}
            className="text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Hapus catatan
          </button>
        </div>

        <div className="p-5 rounded-2xl bg-[#15161c] border border-stone-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm sm:text-base text-zinc-100 font-medium">
                Kamu sudah menyelesaikan{' '}
                <strong className="text-orange-400 font-bold">{readingStats.completedCount}</strong>{' '}
                ringkasan.
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Sejak {readingStats.joinedDate}. Topik yang paling sering kamu baca:{' '}
                <span className="text-orange-300 font-semibold">{readingStats.favoriteTopic}</span>.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0 text-xs">
              <div className="text-right">
                <span className="text-zinc-400">Tersimpan:</span>
                <span className="text-zinc-200 font-bold ml-1.5">{savedBooks.length}</span>
              </div>
              <div className="h-4 w-px bg-stone-800" />
              <div className="text-right">
                <span className="text-zinc-400">Total Anotasi:</span>
                <span className="text-zinc-200 font-bold ml-1.5">{annotations.length}</span>
              </div>
            </div>
          </div>

          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(15, readingStats.completedCount * 30))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tabs: [Tersimpan] [Riwayat & Kemajuan] [Jurnal Anotasi] */}
      <div className="mt-8 mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'saved'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bookmark size={15} />
            <span>Tersimpan ({savedBooks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History size={15} />
            <span>Kemajuan Membaca ({readingHistory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('journal')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'journal'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText size={15} />
            <span>Jurnal Anotasi ({annotations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'uploads'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload size={15} />
            <span>Buku Unggahan ({customBooks.length})</span>
          </button>
        </div>

        <button
          onClick={() => onOpenUpload?.('personal')}
          className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-orange-600/20 transition-all cursor-pointer"
        >
          <Upload size={14} />
          <span>Unggah Buku (PDF/DOCX/EPUB)</span>
        </button>
      </div>

      {/* SEARCH AND SORT TOOLBAR (User Request requirement) */}
      <div className="mb-6 p-4 rounded-2xl bg-[#14151b] border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input: Title or Author */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan judul atau penulis..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
            <ArrowUpDown size={14} className="text-orange-500" />
            <span className="hidden sm:inline">Urutkan:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BookSortOption)}
            className="bg-stone-900 border border-stone-700/80 text-zinc-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-orange-500 cursor-pointer"
          >
            <option value="recent">Terakhir Ditambahkan / Dibaca</option>
            <option value="title-asc">Judul: A ke Z</option>
            <option value="title-desc">Judul: Z ke A</option>
            <option value="author-asc">Penulis: A ke Z</option>
            <option value="author-desc">Penulis: Z ke A</option>
            <option value="progress">Kemajuan Membaca Tertinggi</option>
          </select>
        </div>
      </div>

      {/* TAB 1: TERSIMPAN */}
      {activeTab === 'saved' && (
        <div className="space-y-8">
          {filteredAndSortedSavedBooks.length === 0 ? (
            <div className="py-16 text-center bg-[#14151b] border border-dashed border-stone-800 rounded-2xl p-8">
              <Bookmark size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-200">
                {searchQuery ? 'Tidak ada buku tersimpan yang cocok dengan pencarian' : 'Belum ada buku tersimpan'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                {searchQuery 
                  ? `Tidak menemukan buku atau penulis "${searchQuery}". Coba kata kunci lain.`
                  : 'Ketuk ikon bookmark pada buku mana pun untuk menyimpannya di sini agar mudah dibaca kembali.'}
              </p>
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-zinc-200 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Hapus filter pencarian
                </button>
              ) : (
                <button
                  onClick={onExplore}
                  className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Jelajahi perpustakaan
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {filteredAndSortedSavedBooks.map((saved) => {
                const fullBook = allBooks.find(b => b.id === saved.bookId);
                if (!fullBook) return null;

                return (
                  <div
                    key={saved.bookId}
                    className="bg-[#15161c] hover:bg-[#181a23] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between group relative"
                  >
                    <button
                      onClick={() => toggleSaveBook(fullBook)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-orange-500 cursor-pointer"
                      title="Hapus dari tersimpan"
                    >
                      <Bookmark size={15} fill="currentColor" />
                    </button>

                    <div 
                      onClick={() => onSelectBook(fullBook, saved.currentChapterId)}
                      className="cursor-pointer"
                    >
                      <div className="flex justify-center py-2">
                        <BookCover book={fullBook} size="sm" />
                      </div>
                      <h3 className="font-serif font-bold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2 mt-3">
                        {fullBook.title}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 truncate">
                        {fullBook.author}
                      </p>
                      
                      {/* Reading progress bar */}
                      <div className="mt-2.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Progres:</span>
                          <span className="text-orange-400 font-semibold">{saved.progress}%</span>
                        </div>
                        <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full" 
                            style={{ width: `${saved.progress}%` }} 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onExportWorkspace(fullBook)}
                        className="text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                        title="Ekspor ke Google Workspace"
                      >
                        <Share2 size={13} />
                        <span className="text-[10px]">Ekspor</span>
                      </button>
                      <button
                        onClick={() => onSelectBook(fullBook, saved.currentChapterId)}
                        className="text-orange-400 font-semibold cursor-pointer"
                      >
                        Lanjut →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Backup Impor & Ekspor Controls */}
          <div className="pt-6 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
            <span>Pencadangan Berkas Pribadi:</span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportBackup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg text-zinc-300 transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Unduh Cadangan (.json)</span>
              </button>

              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg text-zinc-300 transition-colors cursor-pointer">
                <Upload size={13} />
                <span>Pulihkan Cadangan</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          {backupMessage && (
            <p className="text-xs text-orange-400 text-center font-medium animate-in fade-in">
              {backupMessage}
            </p>
          )}
        </div>
      )}

      {/* TAB 2: RIWAYAT & KEMAJUAN MEMBACA */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">
              Menampilkan {filteredAndSortedHistory.length} buku dalam riwayat kemajuan membaca
            </span>
            {readingHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Hapus semua riwayat
              </button>
            )}
          </div>

          {filteredAndSortedHistory.length === 0 ? (
            <div className="py-16 text-center bg-[#14151b] border border-dashed border-stone-800 rounded-2xl p-8">
              <History size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-200">
                {searchQuery ? 'Tidak ada riwayat yang cocok' : 'Belum ada riwayat membaca'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                Buka salah satu buku dari perpustakaan untuk mulai membaca dan melacak kemajuan bab Anda secara otomatis.
              </p>
              <button
                onClick={onExplore}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Mulai Membaca
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedHistory.map((item) => {
                const fullBook = allBooks.find(b => b.id === item.bookId);
                return (
                  <div
                    key={item.bookId}
                    className="p-4 rounded-2xl bg-[#14151b] border border-stone-800 hover:border-stone-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      {fullBook && (
                        <div className="w-12 h-16 shrink-0 rounded-lg overflow-hidden flex items-center justify-center">
                          <BookCover book={fullBook} size="sm" />
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] text-orange-400 font-semibold uppercase tracking-wider">
                          {item.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-zinc-100">
                          {item.title}
                        </h4>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          oleh {item.author} · {item.currentChapterTitle || 'Bab 1'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:justify-end">
                      <div className="w-32">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1">
                          <span>Selesai:</span>
                          <span className="text-orange-400 font-bold">{item.progress}%</span>
                        </div>
                        <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-orange-500 h-full rounded-full" 
                            style={{ width: `${item.progress}%` }} 
                          />
                        </div>
                      </div>

                      {fullBook && (
                        <button
                          onClick={() => onSelectBook(fullBook, item.currentChapterId)}
                          className="px-3.5 py-1.5 bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Lanjut Baca
                        </button>
                      )}

                      <button
                        onClick={() => removeHistoryItem(item.bookId)}
                        className="p-2 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Hapus dari riwayat"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: JURNAL ANOTASI */}
      {activeTab === 'journal' && (
        <div className="space-y-6">
          {/* Filter by Book */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-zinc-400">Filter berdasarkan Buku:</span>
            <select
              value={selectedBookFilter}
              onChange={(e) => setSelectedBookFilter(e.target.value)}
              className="bg-stone-900 border border-stone-800 text-zinc-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">Semua Buku ({annotations.length})</option>
              {allBooks.map(b => {
                const count = annotations.filter(a => a.bookId === b.id).length;
                if (count === 0) return null;
                return (
                  <option key={b.id} value={b.id}>
                    {b.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {filteredAnnotations.length === 0 ? (
            <div className="py-16 text-center bg-[#14151b] border border-dashed border-stone-800 rounded-2xl p-8">
              <FileText size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="text-sm font-semibold text-zinc-200">
                {searchQuery ? 'Tidak ada anotasi yang cocok' : 'Belum ada anotasi atau catatan'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6">
                Buka buku apa saja, lalu sorot teks yang menarik untuk memberi warna highlight dan menambahkan catatan refleksi Anda.
              </p>
              <button
                onClick={onExplore}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Mulai Membaca &amp; Menandai
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAnnotations.map((ann) => {
                const fullBook = allBooks.find(b => b.id === ann.bookId);
                const colorBorder = {
                  yellow: 'border-l-yellow-400',
                  green: 'border-l-emerald-400',
                  blue: 'border-l-sky-400',
                  purple: 'border-l-purple-400',
                  orange: 'border-l-orange-400',
                }[ann.color] || 'border-l-yellow-400';

                return (
                  <div
                    key={ann.id}
                    className={`bg-[#14151b] border border-stone-800 border-l-4 ${colorBorder} rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-sm`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                        <div>
                          <h4 className="font-serif font-bold text-xs text-zinc-200">
                            {ann.bookTitle}
                          </h4>
                          <span className="text-[10px] text-orange-400">
                            {ann.chapterTitle}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleShareAnnotation(ann.id)}
                            className={`flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              ann.isShared 
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300' 
                                : 'bg-stone-900 border-stone-800 text-slate-400 hover:text-white'
                            }`}
                            title={ann.isShared ? 'Sorotan publik. Klik untuk jadikan pribadi.' : 'Sorotan pribadi. Klik untuk bagikan ke komunitas.'}
                          >
                            {ann.isShared ? (
                              <>
                                <Globe className="w-2.5 h-2.5" />
                                <span>Publik</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-2.5 h-2.5" />
                                <span>Pribadi</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteAnnotation(ann.id)}
                            className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Hapus anotasi"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <blockquote className="italic text-zinc-300 text-xs leading-relaxed my-2 font-serif">
                        "{ann.selectedText}"
                      </blockquote>

                      {ann.note && (
                        <div className="p-2.5 rounded-xl bg-stone-900/90 text-xs text-zinc-300 border border-stone-800">
                          <span className="text-[10px] text-zinc-500 uppercase font-bold block mb-0.5">Catatan Saya:</span>
                          {ann.note}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>{new Date(ann.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {fullBook && (
                        <button
                          onClick={() => onExportWorkspace(fullBook, ann)}
                          className="text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Share2 size={12} />
                          <span>Ekspor Catatan</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BUKU UNGGAHAN PRIBADI (PDF, DOCX, EPUB) */}
      {activeTab === 'uploads' && (
        <div className="space-y-6">
          {/* Quota & VIP Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-[#181922] to-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                isVip 
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : 'bg-stone-800 text-zinc-400 border border-stone-700'
              }`}>
                {isVip ? <Crown className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-zinc-200">
                    {isVip ? 'Member VIP Aktif — Unggah Tanpa Batas' : `Kuota Akun Gratis: ${customBooks.length} / ${maxFreeUploads} Buku`}
                  </h4>
                  {isVip && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      VIP Unlimited
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  {isVip 
                    ? 'Anda bebas mengunggah buku PDF, DOCX, dan EPUB koleksi pribadi sebanyak mungkin.' 
                    : canUploadMoreCustomBooks
                      ? 'Anda masih memiliki 1 slot unggah buku gratis (PDF, DOCX, atau EPUB).'
                      : 'Slot gratis telah terpakai. Upgrade ke VIP untuk mengunggah buku tanpa batas.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isVip && (
                <button
                  onClick={() => onOpenSubscription?.('Upgrade ke VIP untuk membuka kuota unggah buku tanpa batas!')}
                  className="px-3.5 py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Crown size={13} />
                  <span>Upgrade VIP</span>
                </button>
              )}
              <button
                onClick={() => onOpenUpload?.('personal')}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Upload size={13} />
                <span>+ Unggah File Baru</span>
              </button>
            </div>
          </div>

          {/* List of Uploaded Books */}
          {customBooks.length === 0 ? (
            <div className="py-16 text-center bg-[#14151b] border border-dashed border-stone-800 rounded-3xl p-8">
              <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-3 text-zinc-500">
                <BookOpen size={30} />
              </div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Belum Ada Buku yang Diunggah
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
                Punya e-book PDF, dokumen DOCX, atau file EPUB? Unggah sekarang dan nikmati membaca dengan antarmuka F15, highlight warna, dan AI Mentor.
              </p>
              <button
                onClick={() => onOpenUpload?.('personal')}
                className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-orange-600/20 cursor-pointer inline-flex items-center gap-2"
              >
                <Upload size={14} />
                <span>Unggah Buku Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customBooks.map((b) => (
                <div
                  key={b.id}
                  className="bg-[#14151b] border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:border-stone-700 transition-all shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-14 h-20 rounded-xl bg-gradient-to-br ${b.coverColor} flex flex-col items-center justify-center shrink-0 shadow-md text-white p-1 text-center`}>
                      <BookOpen className="w-5 h-5 mb-1 opacity-90" />
                      {b.fileType && (
                        <span className="text-[9px] uppercase font-mono font-bold tracking-wider opacity-80">
                          {b.fileType.replace('.', '')}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-orange-950/60 text-orange-400 border border-orange-800/60">
                          {b.category}
                        </span>
                        {b.fileType && (
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono uppercase bg-stone-900 text-zinc-400 border border-stone-800">
                            {b.fileType}
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-zinc-100 line-clamp-1">
                        {b.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate mt-0.5">{b.author}</p>
                      <div className="flex items-center space-x-2 text-[10px] text-zinc-500 mt-2">
                        <span>{b.chapters.length} Bab</span>
                        <span>·</span>
                        <span>~{b.readTimeMinutes} mnt baca</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed italic bg-stone-900/50 p-2.5 rounded-xl border border-stone-800/80">
                    "{b.description}"
                  </p>

                  <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between">
                    <button
                      onClick={() => onSelectBook(b)}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold rounded-xl flex items-center space-x-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <BookOpen size={13} />
                      <span>Baca Buku</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Hapus buku "${b.title}" dari daftar unggahan Anda?`)) {
                          deleteCustomBook(b.id);
                        }
                      }}
                      className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-stone-900 rounded-xl transition-colors cursor-pointer"
                      title="Hapus buku unggahan ini"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
