import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';

interface BookCarouselProps {
  title: string;
  subtitle?: string;
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({
  title,
  subtitle,
  books,
  onSelectBook
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="my-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Gulir ke kiri"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
            title="Gulir ke kanan"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {books.map((book) => (
          <div
            key={book.id}
            onClick={() => onSelectBook(book)}
            className="w-56 sm:w-64 shrink-0 snap-start bg-[#15161c] hover:bg-[#181922] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all duration-300 cursor-pointer group flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1"
          >
            <div>
              {/* Cover Container */}
              <div className="flex justify-center py-2">
                <BookCover book={book} size="md" />
              </div>

              {/* Text Info */}
              <div className="mt-3 space-y-1 text-left">
                <span className="text-[10px] font-medium text-orange-400/90 uppercase tracking-wider block truncate">
                  {book.category}
                </span>

                <h3 className="font-serif font-bold text-sm sm:text-base text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-1">
                  {book.title}
                </h3>

                <p className="text-xs text-zinc-400 truncate">
                  {book.author}
                </p>

                <p className="text-[11px] text-zinc-500 line-clamp-2 italic pt-1 leading-snug">
                  "{book.subtitle}"
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-zinc-500" />
                {book.sourceUrl ? book.fileType?.slice(1).toUpperCase() : `${book.readTimeMinutes} menit baca`}
              </span>
              <span className="text-orange-400 text-xs font-medium group-hover:translate-x-0.5 transition-transform">
                Baca →
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
