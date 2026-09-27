import React, { useState, useMemo } from 'react';
import { 
  X, 
  Heart, 
  MessageSquareQuote, 
  Sparkles, 
  Lock, 
  Globe, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  EyeOff, 
  BookOpen,
  Search
} from 'lucide-react';
import { Book, SharedHighlight } from '../types';
import { useAuth } from '../context/AuthContext';

interface SharedHighlightsFeedProps {
  book: Book;
  isOpen: boolean;
  onClose: () => void;
  onJumpToChapter: (chapterId: string) => void;
}

export const SharedHighlightsFeed: React.FC<SharedHighlightsFeedProps> = ({
  book,
  isOpen,
  onClose,
  onJumpToChapter
}) => {
  const { 
    user, 
    getSharedHighlightsForBook, 
    likeSharedHighlight, 
    toggleShareAnnotation 
  } = useAuth();

  const [sortBy, setSortBy] = useState<'popular' | 'recent'>('popular');
  const [selectedChapterFilter, setSelectedChapterFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const rawHighlights = getSharedHighlightsForBook(book.id);

  // Filter & Sort
  const displayedHighlights = useMemo(() => {
    let list = [...rawHighlights];

    // Chapter filter
    if (selectedChapterFilter !== 'all') {
      list = list.filter(h => h.chapterId === selectedChapterFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(h => 
        h.selectedText.toLowerCase().includes(q) ||
        (h.note && h.note.toLowerCase().includes(q)) ||
        (h.chapterTitle && h.chapterTitle.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === 'popular') {
      list.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [rawHighlights, selectedChapterFilter, searchQuery, sortBy]);

  const handleCopyQuote = (highlight: SharedHighlight) => {
    const text = `"${highlight.selectedText}"\n— ${highlight.bookTitle} (${highlight.chapterTitle})`;
    navigator.clipboard.writeText(text);
    setCopiedId(highlight.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentUserId = user?.uid || 'guest';

  if (!isOpen) return null;

  return (
    <div 
      id="shared-highlights-overlay" 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="shared-highlights-drawer" 
        className="w-full max-w-xl h-full bg-slate-900 text-slate-100 border-l border-slate-800 shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <MessageSquareQuote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-lg text-white">Feed Sorotan Komunitas</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                  {rawHighlights.length} Kutipan
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-sm">
                {book.title} &bull; {book.author}
              </p>
            </div>
          </div>
          <button 
            id="close-shared-highlights-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Tutup Feed"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Notice Banner */}
        <div className="p-3.5 bg-slate-950/40 border-b border-slate-800/80 px-5 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-emerald-400 font-medium">Privasi Terjaga:</strong> Seluruh sorotan dan catatan Anda bersifat 
            <span className="text-amber-300 font-semibold"> 100% pribadi secara default</span>. Kutipan hanya akan muncul di feed ini jika Anda mengaktifkan opsi berbagi secara sadar.
          </p>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Sort Toggle */}
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button 
                id="filter-popular-highlights-btn"
                onClick={() => setSortBy('popular')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortBy === 'popular' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Paling Populer</span>
              </button>
              <button 
                id="filter-recent-highlights-btn"
                onClick={() => setSortBy('recent')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  sortBy === 'recent' 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Terbaru</span>
              </button>
            </div>

            {/* Chapter Selector */}
            <select
              id="chapter-filter-select"
              value={selectedChapterFilter}
              onChange={(e) => setSelectedChapterFilter(e.target.value)}
              aria-label="Filter berdasarkan bab buku"
              className="text-xs bg-slate-950 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 max-w-[180px]"
            >
              <option value="all">Semua Bab ({book.chapters.length})</option>
              {book.chapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  Bab {ch.number}: {ch.title.substring(0, 24)}...
                </option>
              ))}
            </select>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              id="search-highlights-input"
              type="text"
              placeholder="Cari kutipan, ide, atau refleksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-2 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Highlights List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {displayedHighlights.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-400 mb-3">
                <MessageSquareQuote className="w-7 h-7 text-slate-500" />
              </div>
              <h4 className="text-sm font-semibold text-slate-200 mb-1">
                {searchQuery || selectedChapterFilter !== 'all' 
                  ? 'Tidak ada kutipan yang sesuai filter' 
                  : 'Belum ada kutipan yang dibagikan'}
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-4">
                Jadilah yang pertama membagikan intisari inspiratif dari buku ini ke sesama pembaca! Tandai teks saat membaca dan aktifkan tombol "Bagikan".
              </p>
            </div>
          ) : (
            displayedHighlights.map((highlight) => {
              const isLiked = (highlight.likedBy || []).includes(currentUserId);
              const isOwner = user && highlight.userId === user.uid;

              const colorBorderMap: Record<string, string> = {
                yellow: 'border-amber-400/50 bg-amber-950/20 text-amber-200',
                green: 'border-emerald-400/50 bg-emerald-950/20 text-emerald-200',
                blue: 'border-sky-400/50 bg-sky-950/20 text-sky-200',
                orange: 'border-orange-400/50 bg-orange-950/20 text-orange-200',
                purple: 'border-purple-400/50 bg-purple-950/20 text-purple-200'
              };

              const borderStyle = colorBorderMap[highlight.color] || colorBorderMap.yellow;

              return (
                <div 
                  key={highlight.id}
                  id={`community-quote-${highlight.id}`}
                  className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 transition-all hover:border-slate-700/80 shadow-xs space-y-3"
                >
                  {/* Card Header: Reader & Chapter info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5">
                      {highlight.isAnonymous ? (
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                          <EyeOff className="w-3.5 h-3.5" />
                        </div>
                      ) : highlight.userPhotoURL ? (
                        <img 
                          src={highlight.userPhotoURL} 
                          alt={highlight.userDisplayName || 'Pembaca'} 
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs">
                          {(highlight.userDisplayName || 'P').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-medium text-slate-200">
                            {highlight.isAnonymous ? 'Pembaca Anonim' : (highlight.userDisplayName || 'Pembaca Komunitas')}
                          </span>
                          {isOwner && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                              Milik Anda
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(highlight.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <button 
                      onClick={() => onJumpToChapter(highlight.chapterId)}
                      className="flex items-center space-x-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-colors"
                      title="Baca bab ini"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span className="truncate max-w-[110px]">{highlight.chapterTitle}</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Quoted Text */}
                  <blockquote className={`pl-3 border-l-2 py-1 italic font-serif text-sm leading-relaxed rounded-r-md ${borderStyle}`}>
                    "{highlight.selectedText}"
                  </blockquote>

                  {/* Reflection Note / Insight */}
                  {highlight.note && (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 space-y-1">
                      <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-medium">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>Catatan & Insight Pembaca:</span>
                      </div>
                      <p className="italic text-slate-200 leading-relaxed font-sans">
                        "{highlight.note}"
                      </p>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-xs">
                    {/* Upvote / Helpful Button */}
                    <button
                      id={`like-btn-${highlight.id}`}
                      onClick={() => likeSharedHighlight(book.id, highlight.id)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                        isLiked 
                          ? 'bg-rose-950/50 border-rose-800 text-rose-300 font-medium' 
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                      title={isLiked ? 'Batal menyukai' : 'Tandai bermanfaat'}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{highlight.likesCount || 0} Bermanfaat</span>
                    </button>

                    <div className="flex items-center space-x-2">
                      {/* Copy Quote Button */}
                      <button
                        id={`copy-btn-${highlight.id}`}
                        onClick={() => handleCopyQuote(highlight)}
                        className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                        title="Salin Kutipan"
                      >
                        {copiedId === highlight.id ? (
                          <span className="flex items-center space-x-1 text-emerald-400 text-[11px] px-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Tersalin</span>
                          </span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Owner option to revoke sharing right from feed */}
                      {isOwner && (
                        <button
                          id={`unshare-btn-${highlight.id}`}
                          onClick={() => toggleShareAnnotation(highlight.id)}
                          className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-amber-300 px-2 py-1 rounded bg-slate-900 border border-slate-800 hover:border-amber-700/50 transition-colors"
                          title="Tarik kembali menjadi pribadi"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Jadikan Pribadi</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Instruction */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-center shrink-0">
          <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bagikan kutipan favorit Anda dari menu penanda di dalam bacaan.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
