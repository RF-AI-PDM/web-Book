import React, { useState } from 'react';
import { Sparkles, Brain, X, Send, ChevronDown, ChevronUp, Copy, Check, BookmarkPlus } from 'lucide-react';
import { Book } from '../types';
import { useAuth } from '../context/AuthContext';

interface AIMentorModalProps {
  book: Book;
  chapterTitle?: string;
  highlightedText?: string;
  onClose: () => void;
  onSaveAsAnnotation?: (note: string, quote: string) => void;
}

export const AIMentorModal: React.FC<AIMentorModalProps> = ({
  book,
  chapterTitle,
  highlightedText,
  onClose,
  onSaveAsAnnotation
}) => {
  const { annotations } = useAuth();
  const [query, setQuery] = useState(
    highlightedText
      ? `Jelaskan implikasi mendalam dari kutipan ini: "${highlightedText}"`
      : 'Bagaimana konsep di bab ini dapat diterapkan secara praktis dalam strategi nyata?'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ analysis: string; thoughts?: string; model: string } | null>(null);
  const [showThoughts, setShowThoughts] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const quickQuestions = [
    'Bandingkan gagasan buku ini dengan prinsip Sun Tzu atau Peter Drucker',
    'Bagaimana menerapkan konsep ini pada bisnis lokal/UMKM?',
    'Berikan kritik konstruktif dan kelemahan dari argumen penulis',
    'Buat rencana aksi implementasi 30 hari yang terukur'
  ];

  const handleAsk = async (questionText?: string) => {
    const textToSend = questionText || query;
    if (!textToSend.trim()) return;

    setIsLoading(true);
    setResult(null);

    try {
      const relatedNotes = annotations
        .filter(a => a.bookId === book.id)
        .map(a => `[Bab ${a.chapterTitle}] "${a.selectedText}" -> Catatan: ${a.note || ''}`);

      const response = await fetch('/api/gemini/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title,
          author: book.author,
          category: book.category,
          chapterTitle: chapterTitle || book.chapters[0]?.title,
          highlightedText: highlightedText || undefined,
          userQuery: textToSend,
          annotationsContext: relatedNotes.slice(0, 5)
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi server AI');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setResult({
        model: 'gemini-3.1-pro-preview',
        analysis: `Maaf, terjadi kesalahan: ${err.message || 'Koneksi terganggu'}. Silakan coba beberapa saat lagi.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.analysis) {
      navigator.clipboard.writeText(result.analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToBook = () => {
    if (result?.analysis && onSaveAsAnnotation) {
      onSaveAsAnnotation(
        `[Insight Gemini Thinking]: ${result.analysis.slice(0, 300)}...`,
        highlightedText || `${book.title} - Bab ${chapterTitle}`
      );
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#14151b] border border-stone-700 rounded-3xl shadow-2xl p-6 text-zinc-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Brain size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-zinc-100">
                  Mentor Buku Cerdas
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-orange-950/80 border border-orange-500/30 text-orange-400">
                  gemini-3.1-pro-preview · HIGH THINKING
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Membahas: <strong className="text-zinc-200">{book.title}</strong>
                {chapterTitle ? ` · Bab: ${chapterTitle}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Highlight Context Notice */}
        {highlightedText && (
          <div className="my-3 p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200 shrink-0 flex items-start gap-2">
            <Sparkles size={14} className="text-orange-400 shrink-0 mt-0.5" />
            <p className="line-clamp-2 italic leading-relaxed">
              Kutipan Pembaca: "{highlightedText}"
            </p>
          </div>
        )}

        {/* Scrollable Results & Thoughts Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick query chips if no result yet */}
          {!result && !isLoading && (
            <div className="space-y-3 pt-2">
              <span className="text-xs text-zinc-400 font-semibold block">
                Pertanyaan Rekomendasi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(q);
                      handleAsk(q);
                    }}
                    className="p-3 text-left rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800/80 text-xs text-zinc-300 hover:text-orange-400 transition-colors cursor-pointer"
                  >
                    "{q}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Animation with Thinking Indicator */}
          {isLoading && (
            <div className="py-12 text-center space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-orange-600/10 border border-orange-500/20 text-orange-400 animate-pulse">
                <Brain size={32} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-zinc-200">
                  Sedang Menalar Secara Mendalam...
                </p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Model Gemini 3.1 Pro sedang memproses premis buku, mengekstrak implikasi logis, dan menyusun sintesis komprehensif.
                </p>
              </div>
            </div>
          )}

          {/* Render Result */}
          {result && (
            <div className="space-y-4">
              {/* Collapsible Thinking Process if available */}
              {result.thoughts && (
                <div className="rounded-xl border border-stone-800 bg-stone-900/60 overflow-hidden">
                  <button
                    onClick={() => setShowThoughts(!showThoughts)}
                    className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Brain size={13} className="text-orange-400" />
                      <span>Alur Berpikir Model (Thinking Steps)</span>
                    </span>
                    {showThoughts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {showThoughts && (
                    <div className="p-4 pt-1 text-[11px] font-mono text-zinc-400 border-t border-stone-800/60 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {result.thoughts}
                    </div>
                  )}
                </div>
              )}

              {/* Main Analysis Text */}
              <div className="p-5 rounded-2xl bg-[#171822] border border-stone-800 text-sm leading-relaxed text-zinc-200 space-y-3 whitespace-pre-wrap">
                {result.analysis}
              </div>

              {/* Action bar for results */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copied ? 'Tersalin' : 'Salin Wawasan'}</span>
                  </button>

                  {onSaveAsAnnotation && (
                    <button
                      onClick={handleSaveToBook}
                      className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-zinc-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookmarkPlus size={13} className="text-orange-400" />
                      <span>{savedNotice ? 'Tersimpan di Buku!' : 'Simpan sebagai Anotasi'}</span>
                    </button>
                  )}
                </div>

                <span className="text-[10px] text-zinc-500 font-mono">
                  {result.model}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-stone-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Tanyakan analisis, implikasi strategi, atau analogi..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Analisis</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
