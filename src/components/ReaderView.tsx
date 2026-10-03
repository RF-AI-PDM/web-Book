import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Bookmark, 
  BookmarkCheck, 
  Share2, 
  ListOrdered, 
  Highlighter, 
  Sparkles, 
  ChevronDown, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Trash2, 
  MessageSquare, 
  X,
  Clock,
  Palette,
  RefreshCw,
  MessageSquareQuote,
  Lock,
  Globe,
  Award,
  Flame,
  Target,
  CheckCircle2,
  Timer,
  Crown,
  ExternalLink
} from 'lucide-react';
import { Book, Chapter, Annotation, ContentBlock } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchBookChapterContent } from '../lib/firebase';
import { BookCover } from './BookCover';
import { ReaderCustomizerModal } from './ReaderCustomizerModal';
import { SharedHighlightsFeed } from './SharedHighlightsFeed';
import { PomodoroTimer } from './PomodoroTimer';
import { getChapterBlocks } from '../utils/documentContent';
import { DocumentBlockRenderer } from './DocumentBlockRenderer';
import { PdfTranslationWorkspace } from './PdfTranslationWorkspace';
import { getAnnotationTextUnits, locateAnnotation, locatorFromSelection } from '../utils/annotationLocator';

interface ReaderViewProps {
  book: Book;
  initialChapterId?: string;
  onBack: () => void;
  onOpenAIMentor: (chapterTitle: string, selectedHighlight?: string) => void;
  onOpenWorkspaceExport: (book: Book, annotation?: Annotation) => void;
  onOpenSubscription?: (reason?: string) => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  book,
  initialChapterId,
  onBack,
  onOpenAIMentor,
  onOpenWorkspaceExport,
  onOpenSubscription
}) => {
  const { 
    user,
    isBookSaved, 
    toggleSaveBook, 
    isVip,
    annotations, 
    saveAnnotation, 
    deleteAnnotation, 
    toggleShareAnnotation,
    getSharedHighlightsForBook,
    updateBookProgress,
    syncStatus,
    goalProgress,
    recordReadingMinutes
  } = useAuth();

  const { 
    theme, 
    fontSize, 
    fontFamily, 
    lineHeight, 
    setIsSettingsOpen, 
    isReaderCustomizerOpen, 
    setIsReaderCustomizerOpen 
  } = useTheme();

  // Active chapter state
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(() => {
    if (initialChapterId) {
      const idx = book.chapters.findIndex(c => c.id === initialChapterId);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isAnnotationsDrawerOpen, setIsAnnotationsDrawerOpen] = useState(false);
  const [isSharedFeedOpen, setIsSharedFeedOpen] = useState(false);

  // Floating text selection popover state
  const [selectedRangeText, setSelectedRangeText] = useState<string>('');
  const selectedLocator = useRef<Annotation['locator'] | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(null);
  const [noteInput, setNoteInput] = useState<string>('');
  const [isNoteInputOpen, setIsNoteInputOpen] = useState(false);
  const [selectedColor] = useState<'yellow' | 'green' | 'blue' | 'purple' | 'orange'>('yellow');

  // Opt-in sharing toggle: PRIVATE BY DEFAULT
  const [isSharedOptIn, setIsSharedOptIn] = useState<boolean>(false);
  const [isAnonymousOptIn, setIsAnonymousOptIn] = useState<boolean>(false);

  // Active clicked annotation popup
  const [activeAnnotation, setActiveAnnotation] = useState<Annotation | null>(null);
  const [activeAnnotationPos, setActiveAnnotationPos] = useState<{ top: number; left: number } | null>(null);

  // Active reading goal tracking in reader session
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [showGoalPopover, setShowGoalPopover] = useState<boolean>(false);
  const [celebrationBanner, setCelebrationBanner] = useState<boolean>(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState<boolean>(true);
  const [isOriginalPdfOpen, setIsOriginalPdfOpen] = useState(false);
  const [isPdfTocOpen, setIsPdfTocOpen] = useState(true);
  const [isPdfMentorOpen, setIsPdfMentorOpen] = useState(true);

  const readerContainerRef = useRef<HTMLDivElement>(null);

  const currentChapter: Chapter = book.chapters[currentChapterIndex] || book.chapters[0];
  const isPdfFocusReader = book.fileType === '.pdf';
  const isCurrentChapterLocked = Boolean(
    book.isPremium && 
    !isVip && 
    currentChapterIndex >= (book.previewChaptersCount || 2)
  );

  // On-demand chapter content state for large books with subcollection chapters
  const [dynamicChapterContent, setDynamicChapterContent] = useState<Record<string, string[]>>({});
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);

  useEffect(() => {
    const hasInlineContent = currentChapter && Array.isArray(currentChapter.content) && currentChapter.content.length > 0;
    const hasDynamicContent = Boolean(currentChapter && dynamicChapterContent[currentChapter.id]);

    if (!hasInlineContent && !hasDynamicContent && currentChapter) {
      let isMounted = true;
      setIsLoadingChapter(true);
      fetchBookChapterContent(book.id, currentChapter.id, user?.uid)
        .then((loaded) => {
          if (isMounted) {
            if (loaded && loaded.length > 0) {
              setDynamicChapterContent(prev => ({ ...prev, [currentChapter.id]: loaded }));
            }
            setIsLoadingChapter(false);
          }
        })
        .catch((err) => {
          console.warn('Error loading chapter content:', err);
          if (isMounted) setIsLoadingChapter(false);
        });

      return () => {
        isMounted = false;
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book.id, currentChapter?.id, currentChapter?.content, user?.uid, dynamicChapterContent]);

  const activeParagraphs: string[] = (currentChapter && Array.isArray(currentChapter.content) && currentChapter.content.length > 0)
    ? currentChapter.content
    : (currentChapter && dynamicChapterContent[currentChapter.id]) || [];
  const activeBlocks: ContentBlock[] = currentChapter?.blocks?.length
    ? getChapterBlocks(currentChapter)
    : activeParagraphs.map((text, index) => ({ id: `${currentChapter?.id || 'chapter'}-paragraph-${index}`, type: 'paragraph' as const, text }));

  // Filter annotations for this book and current chapter
  const bookAnnotations = annotations.filter(a => a.bookId === book.id);
  const chapterAnnotations = bookAnnotations.filter(a => a.chapterId === currentChapter.id);

  // Shared highlights for this book
  const sharedHighlightsCount = getSharedHighlightsForBook(book.id).length;

  // Active reading time tracking (records 1 minute every 60s of active reading)
  useEffect(() => {
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        setSessionSeconds(prev => {
          const next = prev + 1;
          if (next > 0 && next % 60 === 0) {
            recordReadingMinutes(1);
          }
          return next;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [recordReadingMinutes]);

  // Show celebratory notification when daily goal is reached in this session
  useEffect(() => {
    if (goalProgress.isTodayAchieved && sessionSeconds > 30 && !celebrationBanner) {
      setCelebrationBanner(true);
    }
  }, [goalProgress.isTodayAchieved, sessionSeconds, celebrationBanner]);

  // Sync progress on chapter change
  useEffect(() => {
    const progress = Math.round(((currentChapterIndex + 1) / book.chapters.length) * 100);
    updateBookProgress(book, currentChapter.id, currentChapter.title, progress);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChapterIndex, book.id]);

  // Handle Text Selection in Reader
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      if (!isNoteInputOpen) {
        setPopoverPosition(null);
        setSelectedRangeText('');
      }
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3) {
      setPopoverPosition(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!readerContainerRef.current?.contains(range.commonAncestorContainer)) return;
    selectedLocator.current = locatorFromSelection(range);
    if (!selectedLocator.current) {
      setPopoverPosition(null);
      setSelectedRangeText('');
      return;
    }
    const rect = range.getBoundingClientRect();

    setSelectedRangeText(text);
    setPopoverPosition({
      top: rect.top + window.scrollY - 50,
      left: Math.max(10, rect.left + window.scrollX + rect.width / 2 - 120),
    });
  };

  // Add Annotation
  const handleSaveHighlight = async (color: 'yellow' | 'green' | 'blue' | 'purple' | 'orange') => {
    if (!selectedRangeText) return;

    await saveAnnotation({
      bookId: book.id,
      bookTitle: book.title,
      chapterId: currentChapter.id,
      chapterTitle: currentChapter.title,
      selectedText: selectedRangeText,
      locator: selectedLocator.current || undefined,
      color,
      note: noteInput.trim() || undefined,
      isShared: isSharedOptIn, // Private by default, opt-in when checked
      isAnonymous: isAnonymousOptIn
    });

    window.getSelection()?.removeAllRanges();
    setPopoverPosition(null);
    setSelectedRangeText('');
    setNoteInput('');
    setIsNoteInputOpen(false);
    // Reset sharing opt-in back to private default
    setIsSharedOptIn(false);
    setIsAnonymousOptIn(false);
  };

  const isSaved = isBookSaved(book.id);

  // Customization classes
  const fontSizeClasses = {
    xs: 'text-xs sm:text-sm',
    small: 'text-sm sm:text-base',
    standard: 'text-base sm:text-lg',
    large: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl'
  }[fontSize];

  const fontFamilyClass = {
    newsreader: 'font-newsreader',
    literata: 'font-literata',
    merriweather: 'font-merriweather',
    jakarta: 'font-jakarta',
    mono: 'font-mono-reader'
  }[fontFamily];

  const lineHeightClasses = {
    compact: 'leading-snug sm:leading-normal',
    standard: 'leading-relaxed sm:leading-8',
    relaxed: 'leading-loose sm:leading-10'
  }[lineHeight];

  // Theme styling for reader canvas
  const themeBgClasses = {
    dark: 'bg-[#0d0e12] text-zinc-200',
    light: 'bg-[#fafafa] text-zinc-800'
  }[theme];

  const themeNavClasses = {
    dark: 'bg-[#0d0e12]/95 border-stone-800 text-zinc-200',
    light: 'bg-white/95 border-zinc-200 text-zinc-800'
  }[theme];

  const themeContainerClasses = {
    dark: 'bg-[#15161c] border-stone-800/80',
    light: 'bg-white border-zinc-200'
  }[theme];

  // Floating overlay surface (selection toolbar, popovers, drawer) — two-tone
  // so it stays readable against light reading themes instead of always dark.
  const isLightSurface = theme === 'light';
  const overlaySurface = isLightSurface
    ? 'bg-white border-zinc-200 text-zinc-800'
    : 'bg-[#16171f] border-stone-700 text-zinc-200';
  const overlayDivider = isLightSurface ? 'border-zinc-200' : 'border-stone-800';
  const overlayHeading = isLightSurface ? 'text-zinc-900' : 'text-zinc-100';
  const overlayMuted = isLightSurface ? 'text-zinc-500' : 'text-zinc-400';
  const overlayMutedStrong = isLightSurface ? 'text-zinc-600' : 'text-zinc-300';
  const overlaySubtle = isLightSurface
    ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
    : 'bg-stone-900 border-stone-800 text-zinc-400';
  const overlayCard = isLightSurface
    ? 'bg-zinc-50 border-zinc-200'
    : 'bg-stone-900/90 border-stone-800/80';
  const overlayButtonSecondary = isLightSurface
    ? 'bg-zinc-100 hover:bg-zinc-200 text-orange-600 border-zinc-200'
    : 'bg-stone-800 hover:bg-stone-700 text-orange-400 border-stone-700';
  const overlayInput = isLightSurface
    ? 'bg-zinc-50 border-zinc-300 text-zinc-800'
    : 'bg-stone-900 border-stone-700 text-zinc-200';

  const renderBlockText = (
    _block: Exclude<ContentBlock, { type: 'image' } | { type: 'pageBreak' }>,
    paragraph: string,
    textId: string,
  ) => {
    const units = getAnnotationTextUnits(activeBlocks);
    const ranges = chapterAnnotations.flatMap(ann => {
      const range = locateAnnotation(ann, { id: textId, text: paragraph }, units);
      return range ? [{ ...range, ann }] : [];
    }).sort((a, b) => a.start - b.start || a.end - b.end);
    const renderedContent: React.ReactNode[] = [];
    let cursor = 0;
    ranges.forEach(({ start, end, ann }) => {
      if (start < cursor) return;
      renderedContent.push(paragraph.slice(cursor, start));
      const annotationTextColor = isPdfFocusReader ? 'text-slate-900' : 'text-yellow-100';
      const colorBg = {
        yellow: `bg-yellow-400/30 border-b-2 border-yellow-500 ${annotationTextColor}`,
        green: `bg-emerald-400/30 border-b-2 border-emerald-500 ${annotationTextColor}`,
        blue: `bg-sky-400/30 border-b-2 border-sky-500 ${annotationTextColor}`,
        purple: `bg-purple-400/30 border-b-2 border-purple-500 ${annotationTextColor}`,
        orange: `bg-orange-400/30 border-b-2 border-orange-500 ${annotationTextColor}`,
      }[ann.color] || 'bg-yellow-400/30 border-b-2 border-yellow-500';

      renderedContent.push(
          <mark
            key={ann.id}
            onClick={(e) => {
              e.stopPropagation();
              setActiveAnnotation(ann);
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              setActiveAnnotationPos({ top: rect.top + window.scrollY - 60, left: Math.max(10, rect.left + window.scrollX) });
            }}
            className={`${colorBg} rounded cursor-pointer hover:opacity-80 transition-opacity font-normal`}
            title="Klik untuk melihat/ubah catatan"
          >
            {ann.selectedText}
          </mark>
      );
      cursor = end;
    });
    renderedContent.push(paragraph.slice(cursor));
    return renderedContent;
  };

  const readerBackground = isPdfFocusReader
    ? 'bg-[#14212a] text-slate-100'
    : themeBgClasses;
  const readerNavigation = isPdfFocusReader
    ? 'bg-[#14212a]/95 border-slate-700/70 text-slate-100'
    : themeNavClasses;

  return (
    <div className={`min-h-screen ${readerBackground} transition-colors duration-200 pb-20 relative`} onMouseUp={handleMouseUp}>
      {/* Sticky Reader Navigation Bar */}
      <div className={`sticky top-0 z-30 w-full border-b backdrop-blur-md px-4 py-3 transition-colors ${readerNavigation}`}>
        <div className={`${isPdfFocusReader ? 'max-w-7xl' : 'max-w-4xl'} mx-auto flex items-center justify-between gap-2`}>
          {/* Back button */}
          <button
            id="reader-back-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-black/10 transition-colors text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          {/* Book & Chapter Indicator with Cloud Sync Status */}
          <div className="text-center truncate max-w-xs sm:max-w-md">
            <div className="flex items-center justify-center gap-1.5">
              <p className="font-serif font-bold text-xs sm:text-sm truncate">
                {book.title}
              </p>
              {syncStatus === 'synced' && (
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-semibold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded-full border border-emerald-800/40" title="Tersinkronisasi ke Cloud">
                  <Check size={10} /> Cloud
                </span>
              )}
              {syncStatus === 'syncing' && (
                <span className="hidden md:inline-flex items-center gap-1 text-[9px] font-semibold text-orange-400 bg-orange-950/40 px-1.5 py-0.5 rounded-full border border-orange-800/40 animate-pulse" title="Menyinkronkan ke Cloud...">
                  <RefreshCw size={10} className="animate-spin" /> Sync
                </span>
              )}
            </div>
            <p className="text-[11px] opacity-70 truncate">
              Bab {currentChapter.number}: {currentChapter.title}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1">
            {book.sourceUrl && (
              <a
                href={book.sourceUrl}
                target={book.fileType === '.pdf' ? '_blank' : undefined}
                rel="noopener noreferrer"
                download={book.fileType === '.epub' ? `${book.title}.epub` : undefined}
                className="p-2 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10"
                title={book.fileType === '.pdf' ? 'Buka PDF asli' : 'Unduh EPUB asli'}
                aria-label={book.fileType === '.pdf' ? 'Buka PDF asli' : 'Unduh EPUB asli'}
              >
                <ExternalLink size={18} />
              </a>
            )}
            {/* Target Membaca Harian Badge */}
            <div className="relative">
              <button
                id="reader-goal-badge-btn"
                onClick={() => setShowGoalPopover(!showGoalPopover)}
                className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                  goalProgress.isTodayAchieved
                    ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                    : 'bg-stone-900/80 border-stone-700/70 text-zinc-300 hover:text-white'
                }`}
                title={`Target Membaca Hari Ini: ${goalProgress.todayMinutes} / ${goalProgress.todayTarget} menit`}
              >
                {goalProgress.isTodayAchieved ? (
                  <CheckCircle2 size={13} className="text-emerald-400" />
                ) : (
                  <Clock size={13} className="text-orange-400" />
                )}
                <span className="font-mono text-[11px]">
                  {goalProgress.todayMinutes}/{goalProgress.todayTarget}m
                </span>
                {goalProgress.currentStreak > 0 && (
                  <span className="flex items-center text-[10px] text-amber-400 pl-0.5">
                    <Flame size={10} className="fill-amber-400" />
                    <span>{goalProgress.currentStreak}</span>
                  </span>
                )}
              </button>

              {/* Goal Popover */}
              {showGoalPopover && (
                <div className={`absolute right-0 top-10 w-72 p-4 rounded-2xl border shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 ${overlaySurface}`}>
                  <div className={`flex items-center justify-between pb-2 border-b ${overlayDivider}`}>
                    <div className={`flex items-center gap-1.5 text-xs font-bold ${overlayHeading}`}>
                      <Target size={14} className="text-orange-500" />
                      <span>Target Membaca Hari Ini</span>
                    </div>
                    <button
                      onClick={() => setShowGoalPopover(false)}
                      className={`p-0.5 cursor-pointer ${overlayMuted} hover:opacity-70`}
                    >
                      <X size={13} />
                    </button>
                  </div>

                  <div className="py-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={overlayMuted}>Kemajuan:</span>
                      <span className="font-bold text-orange-400">
                        {goalProgress.todayMinutes} / {goalProgress.todayTarget} Menit ({goalProgress.todayPercent}%)
                      </span>
                    </div>

                    <div className={`w-full h-2 rounded-full overflow-hidden p-0.5 border ${overlaySubtle}`}>
                      <div
                        className={`h-full rounded-full transition-all ${
                          goalProgress.isTodayAchieved ? 'bg-emerald-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, goalProgress.todayPercent))}%` }}
                      />
                    </div>

                    {goalProgress.isTodayAchieved ? (
                      <p className="text-[11px] text-emerald-400 font-medium">
                        🎉 Target hari ini tercapai! Konsistensi membacamu luar biasa.
                      </p>
                    ) : (
                      <p className={`text-[11px] ${overlayMuted}`}>
                        Tinggal <strong className={overlayMutedStrong}>{goalProgress.todayRemainingMinutes} menit</strong> lagi untuk mencapai target hari ini.
                      </p>
                    )}
                  </div>

                  <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${overlayDivider}`}>
                    <span className={`flex items-center gap-1 ${overlayMuted}`}>
                      <Clock size={12} /> Sesi ini: {Math.floor(sessionSeconds / 60)}m
                    </span>
                    <button
                      onClick={() => recordReadingMinutes(5)}
                      className={`px-2.5 py-1 rounded-lg font-semibold cursor-pointer border ${overlayButtonSecondary}`}
                    >
                      +5 mnt
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pomodoro Focus Timer Toggle */}
            <button
              id="reader-pomodoro-toggle-btn"
              onClick={() => setIsPomodoroOpen(!isPomodoroOpen)}
              className={`p-2 rounded-lg transition-colors cursor-pointer relative ${
                isPomodoroOpen 
                  ? 'text-orange-400 bg-orange-500/10' 
                  : 'opacity-70 hover:opacity-100 hover:bg-black/10'
              }`}
              title={isPomodoroOpen ? 'Sembunyikan Pengatur Waktu Fokus 15 Menit' : 'Tampilkan Pengatur Waktu Fokus 15 Menit'}
            >
              <Timer size={18} />
              {isPomodoroOpen && (
                <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>

            {/* Customizer: Font, Background Color, Size */}
            <button
              id="reader-customizer-btn"
              onClick={() => setIsReaderCustomizerOpen(true)}
              className="p-2 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors cursor-pointer"
              title="Kustomisasi Font, Warna Latar & Ukuran"
            >
              <Palette size={18} />
            </button>

            {/* Feed Sorotan Komunitas Pembaca */}
            <button
              id="reader-community-feed-btn"
              onClick={() => setIsSharedFeedOpen(true)}
              className="p-2 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors cursor-pointer relative"
              title="Feed Sorotan & Kutipan Populer Komunitas"
            >
              <MessageSquareQuote size={18} />
              {sharedHighlightsCount > 0 && (
                <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
                  {sharedHighlightsCount}
                </span>
              )}
            </button>

            {/* Bookmark / Simpan */}
            <button
              id="reader-save-btn"
              onClick={() => toggleSaveBook(book)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isSaved ? 'text-orange-500' : 'opacity-70 hover:opacity-100 hover:bg-black/10'
              }`}
              title={isSaved ? 'Tersimpan di Buku Saya' : 'Simpan buku'}
            >
              {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>

            {/* AI Thinking Mentor */}
            <button
              id="reader-ai-mentor-btn"
              onClick={() => onOpenAIMentor(currentChapter.title)}
              className="p-2 rounded-lg text-orange-500 hover:bg-orange-500/10 transition-colors cursor-pointer relative"
              title="Tanya Mentor AI (Gemini 3.1 Pro Thinking)"
            >
              <Sparkles size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </button>

            {/* Anotasi Drawer Toggle */}
            <button
              id="reader-annotations-btn"
              onClick={() => setIsAnnotationsDrawerOpen(!isAnnotationsDrawerOpen)}
              className="p-2 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 transition-colors cursor-pointer relative"
              title="Daftar Anotasi &amp; Highlight"
            >
              <Highlighter size={18} />
              {chapterAnnotations.length > 0 && (
                <span className="absolute top-1 right-1 px-1 min-w-4 h-4 bg-orange-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center leading-none">
                  {chapterAnnotations.length}
                </span>
              )}
            </button>

            {/* Share / Export to Workspace */}
            <button
              id="reader-share-btn"
              onClick={() => onOpenWorkspaceExport(book)}
              className="p-2 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 transition-colors cursor-pointer"
              title="Ekspor ke Google Docs, Sheets, Gmail, Chat"
            >
              <Share2 size={18} />
            </button>

            {/* Settings */}
            <button
              id="reader-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-lg opacity-75 hover:opacity-100 hover:bg-black/10 transition-colors cursor-pointer"
              title="Pengaturan Aplikasi &amp; Akun"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Reading Progress Line */}
        <div className="w-full bg-black/10 h-0.5 mt-2.5">
          <div
            className="bg-orange-500 h-full transition-all duration-300"
            style={{ width: `${Math.round(((currentChapterIndex + 1) / book.chapters.length) * 100)}%` }}
          />
        </div>
      </div>

      {/* Mode fokus PDF: navigasi bab dan mentor diletakkan di tepi agar halaman tetap menjadi pusat perhatian. */}
      <div className={isPdfFocusReader ? 'mx-auto grid max-w-[1500px] grid-cols-1 gap-5 px-4 py-6 lg:grid-cols-[230px_minmax(0,1fr)_280px] lg:items-start' : ''}>
        {isPdfFocusReader && (
          <aside className={`hidden lg:sticky lg:top-24 lg:block rounded-2xl border border-slate-700/80 bg-[#192a34] p-3 shadow-2xl shadow-black/10 ${isPdfTocOpen ? '' : 'w-fit'}`}>
            <div className="mb-3 flex items-center justify-between gap-2 px-1">
              {isPdfTocOpen && <h2 className="text-sm font-semibold text-slate-100">Daftar isi</h2>}
              <button onClick={() => setIsPdfTocOpen(open => !open)} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white" aria-label={isPdfTocOpen ? 'Ciutkan daftar isi' : 'Buka daftar isi'}>
                <ListOrdered size={16} />
              </button>
            </div>
            {isPdfTocOpen && (
              <nav aria-label="Daftar isi PDF" className="space-y-1">
                {book.chapters.map((chapter, index) => (
                  <button
                    key={chapter.id}
                    onClick={() => setCurrentChapterIndex(index)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-xs transition-colors ${index === currentChapterIndex ? 'bg-teal-400/15 text-teal-200 ring-1 ring-teal-300/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}
                  >
                    <span className="mr-2 font-mono text-[10px] opacity-65">{String(chapter.number).padStart(2, '0')}</span>
                    <span className="line-clamp-2">{chapter.title}</span>
                  </button>
                ))}
              </nav>
            )}
          </aside>
        )}

      {/* Main Content Body */}
      <main className={isPdfFocusReader ? 'min-w-0 rounded-[3px] bg-[#fffdf8] px-6 py-10 text-slate-900 shadow-2xl shadow-black/30 sm:px-12 lg:px-16' : 'max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-16'}>
        {/* Daily Goal Celebration Banner */}
        {celebrationBanner && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <Award size={20} className="text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-white text-sm">Target Membaca Hari Ini Tercapai! 🎉</p>
                <p className="text-[11px] text-emerald-300 mt-0.5">
                  Kamu telah membaca {goalProgress.todayMinutes} menit hari ini ({goalProgress.todayPercent}%). Streak konsistensimu kini {goalProgress.currentStreak} hari!
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationBanner(false)}
              className="p-1 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/50 cursor-pointer ml-3 shrink-0"
              title="Tutup pemberitahuan"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Book Header Meta */}
        <div className="text-center space-y-4 mb-10 pb-8 border-b border-black/10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-orange-500/15 text-orange-500 border border-orange-500/30">
            {book.category}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
            {book.title}
          </h1>

          <p className="text-xs sm:text-sm opacity-80">
            oleh {book.author} · {book.readTimeMinutes} menit baca
          </p>

          {/* Table of Contents Dropdown Button */}
          <div className="relative inline-block pt-2">
            <button
              id="reader-toc-btn"
              onClick={() => setIsTocOpen(!isTocOpen)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-black/10 hover:bg-black/15 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ListOrdered size={15} className="text-orange-500" />
              <span>Daftar isi: Bab {currentChapter.number} ({currentChapter.title})</span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${isTocOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Table of Contents Popover */}
            {isTocOpen && (
              <div className={`absolute left-1/2 -translate-x-1/2 top-12 w-80 sm:w-96 rounded-2xl shadow-2xl p-3 z-50 border ${themeContainerClasses}`}>
                <div className="px-3 py-2 border-b border-black/10 mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-70">
                    Bab Pembahasan ({book.chapters.length})
                  </span>
                  <span className="text-[10px] text-orange-500 font-medium">
                    {Math.round(((currentChapterIndex + 1) / book.chapters.length) * 100)}% selesai
                  </span>
                </div>

                <div className="space-y-1 max-h-72 overflow-y-auto">
                  {book.chapters.map((ch, idx) => {
                    const isLocked = Boolean(book.isPremium && !isVip && idx >= (book.previewChaptersCount || 2));
                    return (
                      <button
                        key={ch.id}
                        onClick={() => {
                          setCurrentChapterIndex(idx);
                          setIsTocOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                          currentChapterIndex === idx
                            ? 'bg-orange-600 text-white font-semibold'
                            : 'hover:bg-black/10 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="truncate flex items-center space-x-1.5">
                          {isLocked ? (
                            <Lock size={12} className="text-amber-400 shrink-0" />
                          ) : (
                            <span className="opacity-70 font-mono">#{ch.number}</span>
                          )}
                          <span className="truncate">{ch.title}</span>
                        </div>
                        <span className="text-[10px] opacity-70 shrink-0 font-mono">
                          {isLocked ? 'VIP' : `${ch.readTimeMinutes} mnt`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Book Cover Spotlight Center Visual */}
          <div className="flex justify-center pt-4">
            <BookCover book={book} size="md" shadow={true} />
          </div>

          {book.fileType === '.pdf' && book.sourceUrl && (
            <button
              onClick={() => setIsOriginalPdfOpen(open => !open)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 text-xs font-semibold text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer"
            >
              <ExternalLink size={14} />
              {isOriginalPdfOpen ? 'Tutup PDF asli + BotDong.read' : 'Buka PDF asli + BotDong.read'}
            </button>
          )}
        </div>

        {isOriginalPdfOpen && book.sourceUrl && (
          <PdfTranslationWorkspace book={book} onClose={() => setIsOriginalPdfOpen(false)} />
        )}

        {/* Active Chapter Heading */}
        <div className="mb-8">
          <span className="text-xs uppercase tracking-widest text-orange-500 font-bold block mb-1 font-mono">
            BAB {currentChapter.number}
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            {currentChapter.title}
          </h2>
          <span className="text-xs opacity-60 flex items-center gap-1 mt-1">
            <Clock size={12} />
            {currentChapter.readTimeMinutes} menit baca
          </span>
        </div>

        {/* Paywall Banner or Full Chapter Content */}
        {isCurrentChapterLocked ? (
          <div className="my-10 p-8 sm:p-10 rounded-3xl bg-[#14151e] border-2 border-amber-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden text-zinc-100">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Crown size={12} />
                <span>Eksklusif Member VIP</span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                Bab Ini Membutuhkan Akses VIP
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Anda telah menyelesaikan bab pratinjau gratis. Lanjutkan membaca bab <strong className="text-zinc-200">"{currentChapter.title}"</strong> dan seluruh bab buku ini dengan berlangganan F15 VIP.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => onOpenSubscription?.(`Lanjutkan membaca "${book.title}" bab ${currentChapter.number} dan akses seluruh katalog VIP tanpa batas.`)}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-xl shadow-orange-600/25 flex items-center justify-center space-x-2 transition-all cursor-pointer w-full sm:w-auto"
              >
                <Crown size={16} />
                <span>Buka Akses Penuh (Upgrade VIP)</span>
              </button>
              <button
                onClick={() => {
                  setCurrentChapterIndex(0);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 bg-stone-800/80 hover:bg-stone-700 text-zinc-300 rounded-2xl text-xs transition-colors cursor-pointer w-full sm:w-auto"
              >
                Kembali ke Bab 1 (Gratis)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Key Quote Box */}
            {currentChapter.keyQuote && (
              <div className="my-8 p-5 sm:p-6 rounded-2xl bg-orange-500/10 border-l-4 border-orange-500 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500">
                  Poin Kunci Bab Ini:
                </span>
                <blockquote className="font-serif italic text-base sm:text-lg leading-relaxed">
                  "{currentChapter.keyQuote}"
                </blockquote>
              </div>
            )}

            {/* Chapter Paragraphs Reader with Custom Typography & Annotations */}
            <div 
              ref={readerContainerRef} 
              className={`space-y-6 ${fontFamilyClass} ${fontSizeClasses} ${lineHeightClasses}`}
            >
              {isLoadingChapter ? (
                <div className="space-y-4 py-8 animate-pulse">
                  <div className="h-4 bg-stone-800/60 rounded w-full" />
                  <div className="h-4 bg-stone-800/60 rounded w-5/6" />
                  <div className="h-4 bg-stone-800/60 rounded w-4/6" />
                  <div className="h-4 bg-stone-800/60 rounded w-full mt-6" />
                  <div className="h-4 bg-stone-800/60 rounded w-11/12" />
                  <div className="h-4 bg-stone-800/60 rounded w-3/4" />
                  <div className="text-center text-xs text-zinc-500 pt-4 font-sans">
                    Memuat isi bab dari cloud storage...
                  </div>
                </div>
              ) : activeBlocks.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 italic">
                  (Tidak ada teks yang dapat dimuat untuk bab ini).
                </div>
              ) : (
                <DocumentBlockRenderer bookId={book.id} blocks={activeBlocks} assets={book.assets} renderText={renderBlockText} />
              )}
            </div>

            {/* Action Item Card */}
            {currentChapter.actionItem && (
              <div className={`mt-10 p-5 rounded-2xl border border-emerald-500/30 space-y-1 text-xs sm:text-sm ${isPdfFocusReader ? 'bg-emerald-50 text-emerald-950' : 'bg-emerald-950/20 text-emerald-300'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                  💡 Langkah Aksi Nyata (Action Item):
                </span>
                <p className="leading-relaxed">
                  {currentChapter.actionItem}
                </p>
              </div>
            )}
          </>
        )}

        {/* Chapter Navigation Footer */}
        <div className="mt-12 pt-8 border-t border-black/10 flex items-center justify-between gap-4">
          <button
            onClick={() => currentChapterIndex > 0 && setCurrentChapterIndex(currentChapterIndex - 1)}
            disabled={currentChapterIndex === 0}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              currentChapterIndex === 0
                ? 'opacity-30 cursor-not-allowed border-black/10'
                : 'hover:bg-black/10 border-black/20'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Bab Sebelumnya</span>
          </button>

          {currentChapterIndex < book.chapters.length - 1 ? (
            <button
              onClick={() => setCurrentChapterIndex(currentChapterIndex + 1)}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <span>Bab Berikutnya</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Check size={16} />
              <span>Selesai Membaca Ringkasan</span>
            </button>
          )}
        </div>
      </main>

        {isPdfFocusReader && (
          <aside className="hidden lg:sticky lg:top-24 lg:block">
            <section className="overflow-hidden rounded-2xl border border-slate-700/80 bg-[#192a34] shadow-2xl shadow-black/15">
              <div className="flex items-center justify-between border-b border-slate-700/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-teal-300" />
                  <h2 className="text-sm font-semibold text-slate-100">Tanya buku</h2>
                </div>
                <button onClick={() => setIsPdfMentorOpen(open => !open)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-700 hover:text-white" aria-label={isPdfMentorOpen ? 'Ciutkan Tanya buku' : 'Buka Tanya buku'}>
                  <ChevronDown size={16} className={isPdfMentorOpen ? '' : '-rotate-90'} />
                </button>
              </div>
              {isPdfMentorOpen && (
                <div className="space-y-4 p-4">
                  <p className="text-xs leading-5 text-slate-300">
                    Ajukan pertanyaan tentang bab ini, atau pilih kutipan untuk mendapatkan penjelasan yang lebih dalam.
                  </p>
                  <div className="rounded-xl border border-teal-300/15 bg-teal-300/10 p-3 text-xs leading-5 text-teal-50">
                    Sedang membaca: <span className="font-semibold">Bab {currentChapter.number}, {currentChapter.title}</span>
                  </div>
                  <button
                    onClick={() => onOpenAIMentor(currentChapter.title)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-3 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-teal-300"
                  >
                    <MessageSquare size={15} />
                    Tanya tentang bab ini
                  </button>
                  <p className="border-t border-slate-700 pt-3 text-[11px] leading-4 text-slate-400">
                    Sorot teks untuk menambah catatan atau mengirim kutipan langsung ke Mentor AI.
                  </p>
                </div>
              )}
            </section>
          </aside>
        )}
      </div>

      {/* FLOATING TEXT SELECTION ANNOTATION POPOVER */}
      {popoverPosition && selectedRangeText && (
        <div
          style={{ top: `${popoverPosition.top}px`, left: `${popoverPosition.left}px` }}
          className={`absolute z-50 rounded-2xl border shadow-2xl p-2.5 flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-150 ${overlaySurface}`}
        >
          <div className="flex items-center gap-1.5">
            {/* Color swatches */}
            <button
              onClick={() => handleSaveHighlight('yellow')}
              className="w-6 h-6 rounded-full bg-yellow-400 hover:scale-110 transition-transform shadow-sm cursor-pointer"
              title="Highlight Kuning"
            />
            <button
              onClick={() => handleSaveHighlight('green')}
              className="w-6 h-6 rounded-full bg-emerald-500 hover:scale-110 transition-transform shadow-sm cursor-pointer"
              title="Highlight Hijau"
            />
            <button
              onClick={() => handleSaveHighlight('blue')}
              className="w-6 h-6 rounded-full bg-sky-500 hover:scale-110 transition-transform shadow-sm cursor-pointer"
              title="Highlight Biru"
            />
            <button
              onClick={() => handleSaveHighlight('purple')}
              className="w-6 h-6 rounded-full bg-purple-500 hover:scale-110 transition-transform shadow-sm cursor-pointer"
              title="Highlight Ungu"
            />
            <button
              onClick={() => handleSaveHighlight('orange')}
              className="w-6 h-6 rounded-full bg-orange-500 hover:scale-110 transition-transform shadow-sm cursor-pointer"
              title="Highlight Oranye"
            />

            <div className={`h-4 w-px mx-1 ${overlayDivider}`} />

            {/* Add note toggle */}
            <button
              onClick={() => setIsNoteInputOpen(!isNoteInputOpen)}
              className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 cursor-pointer border ${overlayButtonSecondary}`}
            >
              <MessageSquare size={13} />
              <span>Catatan</span>
            </button>

            {/* Ask AI Mentor about this text */}
            <button
              onClick={() => {
                onOpenAIMentor(currentChapter.title, selectedRangeText);
                setPopoverPosition(null);
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-600/30 hover:bg-orange-600 text-orange-300 hover:text-white text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Tanyakan ke Mentor AI Thinking"
            >
              <Sparkles size={13} />
              <span>Tanya AI</span>
            </button>
          </div>

          {/* Optional inline Note input */}
          {isNoteInputOpen && (
            <div className={`pt-2 border-t space-y-2 ${overlayDivider}`}>
              <textarea
                autoFocus
                placeholder="Tulis refleksi atau pemikiran Anda tentang kalimat ini..."
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className={`w-64 h-16 border rounded-lg p-2 text-xs focus:outline-none focus:border-orange-500 resize-none ${overlayInput}`}
              />
              <div className="flex justify-end gap-1.5">
                <button
                  onClick={() => setIsNoteInputOpen(false)}
                  className={`px-2 py-1 text-[11px] cursor-pointer hover:opacity-70 ${overlayMuted}`}
                >
                  Batal
                </button>
                <button
                  onClick={() => handleSaveHighlight(selectedColor)}
                  className="px-3 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded text-[11px] font-semibold cursor-pointer"
                >
                  Simpan Catatan
                </button>
              </div>
            </div>
          )}

          {/* Privacy & Opt-In Sharing Toggle (Private by Default) */}
          <div className={`pt-2 border-t space-y-1.5 ${overlayDivider}`}>
            <div className="flex items-center justify-between text-xs">
              <label
                className="flex items-center space-x-2 cursor-pointer select-none group"
                title="Secara default, sorotan Anda 100% pribadi hanya untuk Anda."
              >
                <input
                  id="optin-share-highlight-checkbox"
                  type="checkbox"
                  checked={isSharedOptIn}
                  onChange={(e) => setIsSharedOptIn(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-emerald-500 cursor-pointer"
                />
                <span className="flex items-center space-x-1.5 text-[11px]">
                  {isSharedOptIn ? (
                    <span className="text-emerald-400 font-medium flex items-center space-x-1">
                      <Globe className="w-3 h-3" />
                      <span>Bagikan ke Komunitas</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 group-hover:text-slate-300 flex items-center space-x-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>Pribadi (Default)</span>
                    </span>
                  )}
                </span>
              </label>

              {isSharedOptIn && (
                <label className="flex items-center space-x-1 text-[10px] text-slate-300 cursor-pointer select-none">
                  <input
                    id="optin-anonymous-checkbox"
                    type="checkbox"
                    checked={isAnonymousOptIn}
                    onChange={(e) => setIsAnonymousOptIn(e.target.checked)}
                    className="w-3 h-3 rounded border-stone-700 bg-stone-900 accent-emerald-500 cursor-pointer"
                  />
                  <span>Anonim</span>
                </label>
              )}
            </div>

            {isSharedOptIn && (
              <p className="text-[10px] text-emerald-400/90 leading-tight">
                Kutipan ini akan muncul di Feed Sorotan pembaca lain untuk buku ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* POPUP FOR CLICKED EXISTING HIGHLIGHT */}
      {activeAnnotation && activeAnnotationPos && (
        <div
          style={{ top: `${activeAnnotationPos.top}px`, left: `${activeAnnotationPos.left}px` }}
          className={`absolute z-50 rounded-xl border shadow-2xl p-3 text-xs w-72 space-y-2.5 animate-in fade-in ${overlaySurface}`}
        >
          <div className={`flex items-center justify-between pb-1.5 border-b ${overlayDivider}`}>
            <span className="font-semibold text-orange-400">Anotasi Anda</span>
            <button
              onClick={() => setActiveAnnotation(null)}
              className={`cursor-pointer hover:opacity-70 ${overlayMuted}`}
            >
              <X size={14} />
            </button>
          </div>

          <p className={`italic text-[11px] line-clamp-2 ${overlayMuted}`}>
            "{activeAnnotation.selectedText}"
          </p>

          {activeAnnotation.note && (
            <div className={`p-2 rounded text-xs border ${overlayCard}`}>
              <span className={`text-[10px] font-bold uppercase block mb-0.5 ${overlayMuted}`}>Catatan:</span>
              {activeAnnotation.note}
            </div>
          )}

          {/* Privacy Status & Sharing Opt-in Toggle */}
          <div className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${overlayCard}`}>
            <div className="flex items-center space-x-1.5">
              {activeAnnotation.isShared ? (
                <span className="text-emerald-400 font-medium flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>Publik di Feed</span>
                </span>
              ) : (
                <span className="text-slate-400 flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>Pribadi (Default)</span>
                </span>
              )}
            </div>

            <button
              id={`toggle-share-active-btn-${activeAnnotation.id}`}
              onClick={async () => {
                const willShare = await toggleShareAnnotation(activeAnnotation.id);
                setActiveAnnotation(prev => prev ? { ...prev, isShared: willShare } : null);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer border ${
                activeAnnotation.isShared
                  ? overlayButtonSecondary
                  : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800 border-emerald-700/50'
              }`}
            >
              {activeAnnotation.isShared ? 'Jadikan Pribadi' : 'Bagikan ke Feed'}
            </button>
          </div>

          <div className={`flex items-center justify-between pt-1 border-t ${overlayDivider}`}>
            <button
              onClick={() => {
                onOpenWorkspaceExport(book, activeAnnotation);
                setActiveAnnotation(null);
              }}
              className="text-[11px] text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
            >
              <Share2 size={12} />
              <span>Ekspor</span>
            </button>

            <button
              onClick={() => {
                deleteAnnotation(activeAnnotation.id);
                setActiveAnnotation(null);
              }}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Hapus Highlight</span>
            </button>
          </div>
        </div>
      )}

      {/* ANNOTATIONS SLIDE-OVER DRAWER */}
      {isAnnotationsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className={`w-full max-w-md border-l h-full p-6 overflow-y-auto flex flex-col justify-between ${overlaySurface}`}>
            <div className="space-y-4">
              <div className={`flex items-center justify-between pb-4 border-b ${overlayDivider}`}>
                <div className="flex items-center gap-2">
                  <Highlighter size={18} className="text-orange-500" />
                  <h3 className={`font-serif font-bold text-lg ${overlayHeading}`}>
                    Anotasi di Buku Ini
                  </h3>
                </div>
                <button
                  onClick={() => setIsAnnotationsDrawerOpen(false)}
                  className={`p-1 cursor-pointer hover:opacity-70 ${overlayMuted}`}
                >
                  <X size={18} />
                </button>
              </div>

              {bookAnnotations.length === 0 ? (
                <div className={`py-16 text-center ${overlayMuted}`}>
                  <Highlighter size={32} className="mx-auto mb-2 opacity-30 text-orange-400" />
                  <p className="text-xs">Belum ada highlight atau catatan untuk buku ini.</p>
                  <p className="text-[11px] opacity-70 mt-1">Sorot teks pada bacaan untuk menandai intisari penting.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookAnnotations.map((ann) => (
                    <div
                      key={ann.id}
                      className={`p-4 rounded-xl border space-y-2.5 text-xs ${overlayCard}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-orange-400 font-semibold uppercase">
                          {ann.chapterTitle}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleShareAnnotation(ann.id)}
                            className={`flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                              ann.isShared
                                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                                : overlaySubtle
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
                            className={`cursor-pointer hover:text-rose-400 ${overlayMuted}`}
                            title="Hapus"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <p className={`italic leading-relaxed ${overlayMutedStrong}`}>
                        "{ann.selectedText}"
                      </p>

                      {ann.note && (
                        <div className={`p-2 rounded border-l-2 border-orange-500 ${overlaySubtle}`}>
                          {ann.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Export Action */}
            {bookAnnotations.length > 0 && (
              <div className={`pt-4 border-t ${overlayDivider}`}>
                <button
                  onClick={() => {
                    setIsAnnotationsDrawerOpen(false);
                    onOpenWorkspaceExport(book);
                  }}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Share2 size={15} />
                  <span>Ekspor Semua Catatan ke Google Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Highlights Community Feed Drawer */}
      <SharedHighlightsFeed
        book={book}
        isOpen={isSharedFeedOpen}
        onClose={() => setIsSharedFeedOpen(false)}
        onJumpToChapter={(chapterId) => {
          const idx = book.chapters.findIndex(c => c.id === chapterId);
          if (idx !== -1) {
            setCurrentChapterIndex(idx);
          }
          setIsSharedFeedOpen(false);
        }}
      />

      {/* Reader Customizer Modal */}
      <ReaderCustomizerModal 
        isOpen={isReaderCustomizerOpen} 
        onClose={() => setIsReaderCustomizerOpen(false)} 
      />

      {/* Floating Pomodoro Focus Timer Companion */}
      {isPomodoroOpen && (
        <div className="fixed bottom-6 right-6 z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <PomodoroTimer
            bookTitle={book.title}
            onSessionComplete={() => {
              setCelebrationBanner(true);
              setTimeout(() => setCelebrationBanner(false), 5000);
            }}
          />
        </div>
      )}
    </div>
  );
};
