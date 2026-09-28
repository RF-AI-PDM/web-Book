import React from 'react';
import { Play, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { SavedBook, Book } from '../types';
import { BookCover } from './BookCover';

interface ContinueReadingCardProps {
  readingItem: SavedBook;
  fullBook?: Book;
  onContinue: (bookId: string, chapterId?: string) => void;
}

export const ContinueReadingCard: React.FC<ContinueReadingCardProps> = ({
  readingItem,
  fullBook,
  onContinue
}) => {
  if (!fullBook) return null;

  return (
    <div className="my-8">
      <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-3 flex items-center gap-2">
        <Clock size={14} className="text-orange-500" />
        <span>Lanjut baca</span>
      </h2>

      <div 
        onClick={() => onContinue(readingItem.bookId, readingItem.currentChapterId)}
        className="group relative bg-[#15161c] hover:bg-[#191a22] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 sm:p-5 transition-all duration-200 cursor-pointer shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Thumbnail */}
          <div className="shrink-0 scale-90 -my-1">
            <BookCover book={fullBook} size="sm" shadow={false} />
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-orange-400 bg-orange-950/40 border border-orange-500/20 px-2 py-0.5 rounded">
                {readingItem.progress}% selesai
              </span>
              <span className="text-xs text-zinc-500">
                {fullBook.readTimeMinutes} menit baca
              </span>
            </div>

            <h3 className="font-serif font-bold text-base sm:text-lg text-zinc-100 group-hover:text-orange-400 transition-colors truncate">
              {readingItem.title}
            </h3>

            <p className="text-xs text-zinc-400 truncate">
              {readingItem.author}
            </p>

            <p className="text-xs text-zinc-300 flex items-center gap-1.5 pt-0.5">
              <span className="text-zinc-500">Lanjut dari:</span>
              <span className="font-medium text-orange-300 truncate">
                "{readingItem.currentChapterTitle || 'Bab 1'}"
              </span>
            </p>
          </div>
        </div>

        {/* Progress & Action */}
        <div className="w-full sm:w-48 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800/80">
          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, readingItem.progress)}%` }}
            />
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 group-hover:bg-orange-500 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm">
            <Play size={12} fill="currentColor" />
            <span>Lanjut</span>
          </button>
        </div>
      </div>
    </div>
  );
};
