import React, { useState, useMemo } from 'react';
import { Clock, ArrowRight, Bookmark, BookmarkCheck, Search, ArrowUpDown, X } from 'lucide-react';
import { Book, BookSortOption } from '../types';
import { BookCover } from './BookCover';
import { useAuth } from '../context/AuthContext';

interface BookGridProps {
  title: string;
  subtitle?: string;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onViewAll?: () => void;
  showSearchAndSort?: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({
  title,
  subtitle,
  books,
  onSelectBook,
  onViewAll,
  showSearchAndSort = true
}) => {
  const { isBookSaved, toggleSaveBook } = useAuth();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<BookSortOption>('recent');

  const categories = ['all', 'Future & Innovation', 'Business & Leadership', 'Mind & Behavior', 'Mindfulness & Wisdom'];

  const filteredAndSortedBooks = useMemo(() => {
    const result = books.filter(b => {
      const matchesCategory = selectedFilter === 'all' || b.category === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.subtitle.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });

    result.sort((a, b) => {
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
          return 0; // Natural curated order
      }
    });

    return result;
  }, [books, selectedFilter, searchQuery, sortBy]);

  return (
    <section className="my-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 flex items-center gap-1 cursor-pointer"
          >
            <span>Lihat semua</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Search & Sort Controls */}
      {showSearchAndSort && (
        <div className="mb-5 p-3 rounded-2xl bg-[#14151b] border border-stone-800/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search by title or author */}
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

          {/* Sort Selector */}
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
              <option value="recent">Kurasi Rekomendasi</option>
              <option value="title-asc">Judul: A ke Z</option>
              <option value="title-desc">Judul: Z ke A</option>
              <option value="author-asc">Penulis: A ke Z</option>
              <option value="duration">Durasi Baca Tercepat</option>
            </select>
          </div>
        </div>
      )}

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === cat
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-stone-900 hover:bg-stone-800 text-zinc-400 border border-stone-800'
            }`}
          >
            {cat === 'all' ? 'Semua Topik' : cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredAndSortedBooks.length === 0 ? (
        <div className="py-12 text-center bg-[#14151b] border border-dashed border-stone-800 rounded-2xl p-6">
          <Search size={32} className="mx-auto text-zinc-600 mb-2" />
          <p className="text-xs text-zinc-300 font-semibold">Tidak ada buku yang cocok dengan "{searchQuery}"</p>
          <p className="text-[11px] text-zinc-500 mt-1">Coba gunakan nama penulis atau kata kunci judul lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredAndSortedBooks.map((book) => {
            const saved = isBookSaved(book.id);

            return (
              <div
                key={book.id}
                className="bg-[#14151b] hover:bg-[#181922] border border-stone-800/90 hover:border-stone-700 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 flex flex-col justify-between group shadow-sm hover:shadow-xl hover:-translate-y-1 relative"
              >
                {/* Quick Save Bookmark button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveBook(book);
                  }}
                  className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-stone-900/80 hover:bg-stone-800 text-zinc-400 hover:text-orange-400 transition-colors cursor-pointer"
                  title={saved ? 'Tersimpan di Buku Saya' : 'Simpan buku'}
                >
                  {saved ? (
                    <BookmarkCheck size={15} className="text-orange-500" />
                  ) : (
                    <Bookmark size={15} />
                  )}
                </button>

                <div 
                  onClick={() => onSelectBook(book)}
                  className="cursor-pointer"
                >
                  {/* Cover */}
                  <div className="flex justify-center py-2">
                    <BookCover book={book} size="sm" />
                  </div>

                  {/* Meta */}
                  <div className="mt-3 space-y-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-orange-400 block truncate">
                      {book.category}
                    </span>
                    <h3 className="font-serif font-bold text-sm sm:text-base text-zinc-100 group-hover:text-orange-400 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {book.author}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-zinc-400">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock size={12} className="text-zinc-500" />
                    {book.readTimeMinutes} mnt
                  </span>

                  <button
                    onClick={() => onSelectBook(book)}
                    className="text-orange-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Baca</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
