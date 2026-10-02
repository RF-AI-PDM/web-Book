import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Settings, 
  Bookmark, 
  LogOut, 
  Cloud,
  RefreshCw,
  X,
  Check,
  Flame,
  Crown,
  Upload,
  ShieldAlert,
  Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Book, BookSortOption } from '../types';
import { ThemeModeSelect } from './ThemeModeSelect';

interface NavbarProps {
  currentView: 'home' | 'collections' | 'my-books' | 'reader';
  onNavigate: (view: 'home' | 'collections' | 'my-books') => void;
  onSelectBook: (book: Book) => void;
  allBooks: Book[];
  onOpenUploadModal?: () => void;
  onOpenSubscriptionModal?: () => void;
  onOpenAdminModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onSelectBook,
  allBooks,
  onOpenUploadModal,
  onOpenSubscriptionModal,
  onOpenAdminModal
}) => {
  const { 
    user, 
    signIn, 
    signOutUser, 
    syncStatus, 
    lastSyncedAt, 
    syncNow, 
    goalProgress,
    isVip,
    isAdminMode 
  } = useAuth();
  const { setIsSettingsOpen } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSort, setSearchSort] = useState<BookSortOption>('recent');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    const res = allBooks.filter(
      b =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q)
    );

    res.sort((a, b) => {
      switch (searchSort) {
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        case 'author-asc':
          return a.author.localeCompare(b.author);
        case 'author-desc':
          return b.author.localeCompare(a.author);
        case 'duration':
          return a.readTimeMinutes - b.readTimeMinutes;
        case 'recent':
        default:
          return 0;
      }
    });

    return res;
  }, [allBooks, searchQuery, searchSort]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/80 backdrop-blur-md" style={{ backgroundColor: 'var(--app-navbar-bg)', borderColor: 'var(--app-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div className="flex items-center gap-6">
          <button
            id="nav-logo-btn"
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-zinc-100 hover:text-orange-400 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
              <BookOpen size={19} />
            </div>
            <div className="text-left">
              <span className="font-serif font-bold text-lg tracking-tight block leading-none">
                Evolusi Book
              </span>
              <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-medium">
                Baca. Tumbuh. Berevolusi.
              </span>
            </div>
          </button>

          {/* Nav items */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              id="nav-home-btn"
              onClick={() => onNavigate('home')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'home'
                  ? 'bg-stone-800 text-orange-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-800/50'
              }`}
            >
              Jelajahi
            </button>
            <button
              id="nav-collections-btn"
              onClick={() => onNavigate('collections')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'collections'
                  ? 'bg-stone-800 text-orange-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-800/50'
              }`}
            >
              Koleksi
            </button>
            <button
              id="nav-mybooks-btn"
              onClick={() => onNavigate('my-books')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                currentView === 'my-books'
                  ? 'bg-stone-800 text-orange-400'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-800/50'
              }`}
            >
              Buku Saya
            </button>
          </nav>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reading Goal Streak & Progress Pill */}
          <button
            onClick={() => onNavigate('my-books')}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
              goalProgress.isTodayAchieved
                ? 'bg-emerald-950/40 border-emerald-700/50 hover:border-emerald-500 text-emerald-300'
                : 'bg-stone-900 border-stone-800 hover:border-orange-500/50 text-zinc-300 hover:text-white'
            }`}
            title={`Target Membaca Hari Ini: ${goalProgress.todayMinutes}/${goalProgress.todayTarget} menit (${goalProgress.todayPercent}%). Klik untuk buka di profil.`}
          >
            <Flame size={13} className="text-amber-500 fill-amber-500" />
            <span className="font-mono text-[11px] font-bold text-amber-400">
              {goalProgress.currentStreak}h
            </span>
            <span className="text-stone-600 text-[10px]">·</span>
            <span className="text-[11px] font-medium text-zinc-300">
              {goalProgress.todayMinutes}/{goalProgress.todayTarget}m
            </span>
          </button>

          {/* Cloud Sync Status Indicator */}
          {user && (
            <button
              onClick={() => syncNow()}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 hover:border-stone-700 text-[11px] text-zinc-400 transition-colors cursor-pointer"
              title={lastSyncedAt ? `Terakhir disinkronkan: ${lastSyncedAt}` : 'Klik untuk menyinkronkan data ke Cloud'}
            >
              <Cloud size={13} className={syncStatus === 'synced' ? 'text-emerald-400' : 'text-orange-400'} />
              <span className={syncStatus === 'synced' ? 'text-emerald-400' : 'text-zinc-300'}>
                {syncStatus === 'syncing' ? 'Sinkron...' : syncStatus === 'synced' ? 'Cloud Aktif' : 'Offline'}
              </span>
            </button>
          )}

          {/* Unggah Buku Button */}
          <button
            onClick={onOpenUploadModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-orange-500/50 text-xs font-semibold text-zinc-300 hover:text-white transition-all cursor-pointer"
            title="Unggah buku pribadi (PDF, DOCX, EPUB)"
          >
            <Upload size={13} className="text-orange-400" />
            <span>Unggah</span>
          </button>

          {/* VIP Status or Upgrade Button */}
          {isVip ? (
            <button
              onClick={onOpenSubscriptionModal}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-[11px] font-bold text-amber-300 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
              title="Status Langganan VIP Aktif"
            >
              <Crown size={12} className="text-amber-400" />
              <span>VIP</span>
            </button>
          ) : (
            <button
              onClick={onOpenSubscriptionModal}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              title="Upgrade ke F15 VIP"
            >
              <Crown size={13} />
              <span>VIP</span>
            </button>
          )}

          {/* Admin CMS Button (if admin mode is active) */}
          {isAdminMode && (
            <button
              onClick={onOpenAdminModal}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-600/60 text-amber-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              title="Buka Panel Pemilik / Admin CMS"
            >
              <ShieldAlert size={13} className="text-amber-400" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}

          {/* Quick Search */}
          <div className="relative">
            <button
              id="nav-search-toggle"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-stone-800/60 rounded-lg transition-colors cursor-pointer"
              title="Cari buku atau penulis"
            >
              <Search size={18} />
            </button>

            {isSearchOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#16171d] border border-stone-700 rounded-2xl shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 border-b border-stone-800 pb-2 mb-2">
                  <Search size={16} className="text-zinc-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Cari berdasarkan judul atau penulis..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Sort Option for Search */}
                {searchQuery && (
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pb-2 mb-2 border-b border-stone-800/60">
                    <span>{filteredBooks.length} hasil ditemukan</span>
                    <select
                      value={searchSort}
                      onChange={(e) => setSearchSort(e.target.value as BookSortOption)}
                      className="bg-stone-900 border border-stone-800 text-zinc-300 text-[10px] rounded px-1.5 py-0.5"
                    >
                      <option value="recent">Relevansi</option>
                      <option value="title-asc">Judul A-Z</option>
                      <option value="author-asc">Penulis A-Z</option>
                      <option value="duration">Durasi Baca</option>
                    </select>
                  </div>
                )}

                {/* Search results */}
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {searchQuery && filteredBooks.length === 0 && (
                    <p className="text-xs text-zinc-500 py-4 text-center">
                      Tidak menemukan buku atau penulis dengan kata kunci "{searchQuery}".
                    </p>
                  )}
                  {filteredBooks.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => {
                        onSelectBook(book);
                        setIsSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left p-2 hover:bg-stone-800/70 rounded-xl flex items-center gap-3 transition-colors cursor-pointer group"
                    >
                      <div
                        className="w-8 h-10 rounded shrink-0 flex items-center justify-center text-[8px] font-bold text-zinc-200"
                        style={{ backgroundColor: book.coverColor }}
                      >
                        {book.category[0]}
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-zinc-200 group-hover:text-orange-400 truncate">
                          {book.title}
                        </p>
                        <p className="text-xs text-zinc-400 truncate">
                          oleh <span className="text-zinc-300">{book.author}</span> · {book.sourceUrl ? book.fileType?.slice(1).toUpperCase() : `${book.readTimeMinutes} menit`}
                        </p>
                      </div>
                    </button>
                  ))}
                  {!searchQuery && (
                    <p className="text-[11px] text-zinc-500 text-center py-3">
                      Ketik judul buku seperti "Competing", "AI Superpowers", atau nama penulis seperti "Robert Greene", "Max Tegmark"...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <ThemeModeSelect compact id="nav-theme-selector" />

          {/* Settings Trigger */}
          <button
            id="nav-settings-btn"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-stone-800/60 rounded-lg transition-colors cursor-pointer"
            title="Pengaturan Tampilan &amp; Akun"
          >
            <Settings size={18} />
          </button>

          {/* User Account / Google Sign in */}
          {user ? (
            <div className="relative">
              <button
                id="nav-profile-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 pl-2 bg-stone-800/70 hover:bg-stone-800 border border-stone-700/60 rounded-full transition-colors cursor-pointer"
              >
                <span className="text-xs text-zinc-200 max-w-[90px] truncate hidden sm:inline">
                  {user.displayName?.split(' ')[0] || 'Pengguna'}
                </span>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-orange-500/40"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-600/30 text-orange-400 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 top-11 w-56 bg-[#16171d] border border-stone-700 rounded-2xl shadow-2xl p-2.5 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-stone-800">
                    <p className="font-semibold text-zinc-200 truncate">{user.displayName || 'Pengguna F15'}</p>
                    <p className="text-zinc-400 text-[11px] truncate">{user.email}</p>
                    <div className="mt-1.5 flex items-center justify-between gap-1.5 text-[10px]">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Cloud Aktif</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(user.uid);
                          setCopiedUid(true);
                          setTimeout(() => setCopiedUid(false), 2000);
                        }}
                        className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-orange-400 bg-stone-900/80 hover:bg-stone-800 border border-stone-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                        title={`UID: ${user.uid} (Klik untuk salin ke clipboard)`}
                      >
                        {copiedUid ? <Check size={10} className="text-emerald-400" /> : <Copy size={10} />}
                        <span>{copiedUid ? 'Tersalin!' : 'Salin UID'}</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onNavigate('my-books');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800/80 rounded-xl text-zinc-300 flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <Bookmark size={14} className="text-orange-400" />
                    Buku &amp; Jurnal Saya
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenSubscriptionModal) onOpenSubscriptionModal();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800/80 rounded-xl text-zinc-300 flex items-center gap-2 cursor-pointer"
                  >
                    <Crown size={14} className="text-amber-400" />
                    Langganan F15 VIP
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      if (onOpenAdminModal) onOpenAdminModal();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800/80 rounded-xl text-zinc-300 flex items-center gap-2 cursor-pointer"
                  >
                    <ShieldAlert size={14} className="text-amber-400" />
                    Panel Pemilik (Admin CMS)
                  </button>
                  <button
                    onClick={() => {
                      syncNow();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-stone-800/80 rounded-xl text-zinc-300 flex items-center gap-2 cursor-pointer"
                  >
                    <RefreshCw size={14} className="text-orange-400" />
                    Sinkronkan Sekarang
                  </button>
                  <button
                    onClick={() => {
                      signOutUser();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-rose-950/40 text-rose-400 rounded-xl flex items-center gap-2 cursor-pointer mt-0.5"
                  >
                    <LogOut size={14} />
                    Keluar Akun
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-end gap-1">
              <button
                id="nav-signin-btn"
                onClick={async () => {
                  setSignInLoading(true);
                  setSignInError(null);
                  try {
                    await signIn();
                  } catch (err: any) {
                    if (err?.code === 'auth/popup-blocked') {
                      setSignInError('Popup diblokir browser. Izinkan popup untuk situs ini lalu coba lagi.');
                    } else if (err?.code === 'auth/popup-closed-by-user') {
                      // Ditutup oleh user, tidak perlu pesan error
                    } else if (err?.code === 'auth/unauthorized-domain') {
                      setSignInError('Domain tidak diizinkan. Tambahkan domain ini di Firebase Console → Authentication → Authorized domains.');
                    } else if (err?.code === 'auth/network-request-failed') {
                      setSignInError('Gagal terhubung. Periksa koneksi internet kamu.');
                    } else if (err?.code) {
                      setSignInError(`Gagal masuk: ${err.code}`);
                    }
                  } finally {
                    setSignInLoading(false);
                  }
                }}
                disabled={signInLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                {signInLoading ? (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span className="hidden sm:inline">
                  {signInLoading ? 'Menghubungkan...' : 'Masuk dengan Google'}
                </span>
              </button>
              {signInError && (
                <p className="text-[10px] text-rose-400 max-w-[220px] text-right leading-tight">
                  ⚠️ {signInError}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
