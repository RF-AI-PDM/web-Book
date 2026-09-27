import React from 'react';
import { BookOpen, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';

interface BookOfDayCardProps {
  book: Book;
  onRead: (book: Book) => void;
}

export const BookOfDayCard: React.FC<BookOfDayCardProps> = ({ book, onRead }) => {
  return (
    <div className="my-10">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-2">
          <Sparkles size={14} className="text-amber-400" />
          <span>Buku Hari Ini</span>
        </h2>
        <span className="text-[11px] text-zinc-500 font-mono">
          Edisi 22 September
        </span>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1b1522] via-[#16171e] to-[#121318] border border-amber-500/20 p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 blur-3xl pointer-events-none rounded-full" />

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
          {/* Cover */}
          <div className="sm:col-span-4 flex justify-center sm:justify-start">
            <div 
              onClick={() => onRead(book)}
              className="cursor-pointer transform hover:scale-105 transition-all duration-300"
            >
              <BookCover book={book} size="lg" shadow={true} />
            </div>
          </div>

          {/* Details */}
          <div className="sm:col-span-8 space-y-3.5 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 border border-amber-500/30 text-amber-300">
                {book.category}
              </span>
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                <Clock size={12} />
                {book.readTimeMinutes} menit baca
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-100 leading-tight">
              {book.title}
            </h3>

            <p className="text-sm text-zinc-300 font-medium">
              oleh {book.author}
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed italic line-clamp-2">
              "{book.subtitle}"
            </p>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3">
              {book.description}
            </p>

            <div className="pt-2">
              <button
                id="book-of-day-read-btn"
                onClick={() => onRead(book)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <BookOpen size={16} />
                <span>Baca sekarang</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
