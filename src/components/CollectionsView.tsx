import React, { useState, useMemo } from 'react';
import { Book, BookSortOption } from '../types';
import { CATEGORIES } from '../data/books';
import { ArrowLeft, BookOpen, Layers, ArrowRight, Search, ArrowUpDown, X } from 'lucide-react';
import { BookCover } from './BookCover';

interface CollectionsViewProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onBackToHome: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  books,
  onSelectBook,
  onBackToHome
}) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<BookSortOption>('recent');

  const curatedCategories = CATEGORIES.filter(c => c.id !== 'all');

  const filteredAndSortedBooks = useMemo(() => {
    if (!activeCategory) return [];

    let list = books.filter(b => b.category === activeCategory);

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(b => 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q)
      );
    }

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
        case 'duration':
          return a.readTimeMinutes - b.readTimeMinutes;
        case 'recent':
        default:
          return 0;
      }
    });

    return list;
  }, [books, activeCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-stone-800/80">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-400 transition-colors mb-3 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </button>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-100">
            {activeCategory ? `Koleksi: ${activeCategory}` : 'Koleksi'}
          </h1>
          <p className="text-zinc-400 text-sm mt-1 max-w-xl">
            {activeCategory
              ? CATEGORIES.find(c => c.id === activeCategory)?.description || 'Koleksi terpilih'
              : 'Rak pilihan yang dikelompokkan berdasarkan tema, era, dan suasana hati pembaca.'}
          </p>
        </div>

        {activeCategory ? (
          <button
            onClick={() => {
              setActiveCategory(null);
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>Semua Rak Koleksi</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Layers size={16} className="text-orange-500" />
            <span>{curatedCategories.length} Rak Tematik</span>
          </div>
        )}
      </div>

      {/* If category selected, show books in this collection with Search & Sort */}
      {activeCategory ? (
        <div className="mt-8 space-y-6">
          {/* Search & Sort Toolbar for Collection */}
          <div className="p-3.5 rounded-2xl bg-[#14151b] border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Cari judul buku atau penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-8.5 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 shrink-0">
                <ArrowUpDown size={12} className="text-orange-500" />
                <span>Urutan:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as BookSortOption)}
                className="bg-stone-900 border border-stone-800 text-zinc-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="recent">Kurasi Rak</option>
                <option value="title-asc">Judul: A ke Z</option>
                <option value="title-desc">Judul: Z ke A</option>
                <option value="author-asc">Penulis: A ke Z</option>
                <option value="duration">Durasi Tercepat</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {filteredAndSortedBooks.length === 0 ? (
              <div className="col-span-full py-16 text-center text-zinc-500 bg-[#14151b] border border-dashed border-stone-800 rounded-2xl p-8">
                <BookOpen size={36} className="mx-auto mb-3 opacity-40 text-orange-500" />
                <p className="text-sm font-semibold text-zinc-300">
                  {searchQuery ? `Tidak ada buku yang cocok dengan "${searchQuery}"` : 'Belum ada buku dalam rak ini.'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-3 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-zinc-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            ) : (
              filteredAndSortedBooks.map((book) => (
                <div
                  key={book.id}
                  onClick={() => onSelectBook(book)}
                  className="bg-[#14151b] hover:bg-[#181922] border border-stone-800 hover:border-stone-700 rounded-2xl p-4 transition-all duration-200 cursor-pointer group flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
                >
                  <div>
                    <div className="flex justify-center py-2">
                      <BookCover book={book} size="sm" />
                    </div>
                    <h3 className="font-serif font-bold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2 mt-3">
                      {book.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 truncate">
                      {book.author}
                    </p>
                  </div>
                  <div className="mt-4 pt-2.5 border-t border-stone-800 flex items-center justify-between text-xs text-zinc-500">
                    <span>{book.sourceUrl ? book.fileType?.slice(1).toUpperCase() : `${book.readTimeMinutes} menit`}</span>
                    <span className="text-orange-400 font-medium">Baca →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Curated Shelves Grid with 3D Stacked Book Covers */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {curatedCategories.map((cat) => {
            const categoryBooks = books.filter(b => b.category === cat.id);
            const sampleBook1 = categoryBooks[0] || books[0];
            const sampleBook2 = categoryBooks[1] || books[1];
            const sampleBook3 = categoryBooks[2] || books[2];

            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="group relative bg-[#15161c] hover:bg-[#191a23] border border-stone-800 hover:border-stone-700 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between overflow-hidden"
              >
                {/* 3D Stacked Covers Visual */}
                <div className="h-44 relative flex items-center justify-center mb-6 select-none">
                  {/* Left tilted back book */}
                  <div className="absolute left-6 bottom-2 transform -rotate-15 group-hover:-rotate-20 transition-transform duration-300 opacity-60 scale-75 origin-bottom">
                    <BookCover book={sampleBook2} size="sm" shadow={false} />
                  </div>

                  {/* Right tilted back book */}
                  <div className="absolute right-6 bottom-2 transform rotate-15 group-hover:rotate-20 transition-transform duration-300 opacity-70 scale-75 origin-bottom">
                    <BookCover book={sampleBook3} size="sm" shadow={false} />
                  </div>

                  {/* Center front book */}
                  <div className="relative z-10 transform group-hover:-translate-y-2 transition-transform duration-300 scale-90">
                    <BookCover book={sampleBook1} size="sm" shadow={true} />
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-1.5 text-left border-t border-stone-800/80 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-zinc-100 group-hover:text-orange-400 transition-colors">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-zinc-500 font-mono">
                      {categoryBooks.length} buku
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="mt-4 flex items-center justify-between text-xs text-orange-400 font-medium">
                  <span>Buka rak koleksi</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
