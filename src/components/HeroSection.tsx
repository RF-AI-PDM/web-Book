import React from 'react';
import { ArrowRight, Bookmark, Sparkles, CheckCircle2 } from 'lucide-react';
import { Book } from '../types';
import { BookCover } from './BookCover';

interface HeroSectionProps {
  onExploreCollections: () => void;
  onOpenMyBooks: () => void;
  featuredBooks: Book[];
  onSelectBook: (book: Book) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCollections,
  onOpenMyBooks,
  featuredBooks,
  onSelectBook
}) => {
  const leftBook = featuredBooks[1];
  const centerBook = featuredBooks[0];
  const rightBook = featuredBooks[2];

  return (
    <section className="relative overflow-hidden pt-8 pb-14 sm:py-16 border-b border-stone-800/60">
      {/* Subtle warm glow background */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-orange-600/10 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-xs text-orange-400 font-medium">
            <Sparkles size={13} />
            <span>Koleksi Buku & Anotasi Digital</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-zinc-100 leading-[1.15]">
            Baca buku digital <br className="hidden sm:inline" />
            langsung dari <span className="text-orange-500 italic">koleksi nyata</span>.
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg leading-relaxed max-w-xl">
            Nggak perlu bikin akun. Tinggal pilih buku, langsung baca dengan fitur anotasi cerdas dan sinkronisasi cloud perpustakaan pribadi.
          </p>

          {/* Call to action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-explore-btn"
              onClick={onExploreCollections}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-orange-950/40 cursor-pointer active:scale-98"
            >
              <span>Jelajahi koleksi</span>
              <ArrowRight size={16} />
            </button>

            <button
              id="hero-mybooks-btn"
              onClick={onOpenMyBooks}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-stone-700 hover:border-stone-600 bg-stone-900/60 hover:bg-stone-800 text-zinc-200 font-medium text-sm transition-all duration-200 cursor-pointer"
            >
              <Bookmark size={16} className="text-orange-400" />
              <span>Buku Saya</span>
            </button>
          </div>

          {/* Footnote */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 pt-1">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>{featuredBooks.length} buku PDF dan EPUB tersedia.</span>
          </div>
        </div>

        {/* Right 3D Visual Stack */}
        <div className="lg:col-span-5 flex justify-center items-center relative py-6 select-none">
          <div className="relative flex items-center justify-center w-72 sm:w-80 h-72">
            {/* Left stacked book */}
            {leftBook && (
              <div 
                onClick={() => onSelectBook(leftBook)}
                className="absolute left-2 top-4 transform -rotate-12 hover:-rotate-6 hover:-translate-y-2 transition-all duration-300 z-10 cursor-pointer scale-90 sm:scale-95"
              >
                <BookCover book={leftBook} size="md" shadow={true} />
              </div>
            )}

            {/* Right stacked book */}
            {rightBook && (
              <div 
                onClick={() => onSelectBook(rightBook)}
                className="absolute right-2 top-6 transform rotate-12 hover:rotate-6 hover:-translate-y-2 transition-all duration-300 z-10 cursor-pointer scale-90 sm:scale-95"
              >
                <BookCover book={rightBook} size="md" shadow={true} />
              </div>
            )}

            {/* Center prominent book */}
            {centerBook && (
              <div 
                onClick={() => onSelectBook(centerBook)}
                className="relative z-20 transform hover:scale-105 hover:-translate-y-3 transition-all duration-300 cursor-pointer shadow-2xl"
              >
                <BookCover book={centerBook} size="lg" shadow={true} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
