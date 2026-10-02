import React, { useState } from 'react';
import { 
  ShieldAlert, 
  BookOpen, 
  Plus, 
  Trash2, 
  Crown, 
  X, 
  Eye, 
  UploadCloud
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';

interface AdminBookManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadCatalog: () => void;
  onSelectBook: (book: Book) => void;
}

export const AdminBookManagerModal: React.FC<AdminBookManagerModalProps> = ({
  isOpen,
  onClose,
  onOpenUploadCatalog,
  onSelectBook
}) => {
  const { 
    catalogBooks, 
    allCatalogBooks, 
    deleteCatalogBook, 
    updateCatalogBook 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'custom' | 'all'>('custom');

  if (!isOpen) return null;

  const vipBooksCount = allCatalogBooks.filter(b => b.isPremium).length;
  const freeBooksCount = allCatalogBooks.length - vipBooksCount;

  const handleToggleVip = async (book: Book) => {
    const updated = {
      ...book,
      isPremium: !book.isPremium,
      badge: !book.isPremium ? 'VIP Premium' : 'Katalog Baru'
    };
    await updateCatalogBook(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl bg-[#121319] border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                  Panel Pemilik Platform (Admin CMS)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Mode Owner
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Kelola buku yang tampil di katalog publik, atur status berbayar/gratis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Quick Status & Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-zinc-500">Total Buku Katalog</div>
              <div className="text-xl font-bold font-serif text-white mt-0.5">{allCatalogBooks.length}</div>
            </div>
            <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                <Crown size={12} /> Buku VIP Premium
              </div>
              <div className="text-xl font-bold font-serif text-amber-300 mt-0.5">{vipBooksCount}</div>
            </div>
            <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Buku Gratis</div>
              <div className="text-xl font-bold font-serif text-emerald-300 mt-0.5">{freeBooksCount}</div>
            </div>
            <div className="p-3.5 bg-stone-900/80 border border-stone-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-orange-400">Buku Inputan Pemilik</div>
              <div className="text-xl font-bold font-serif text-orange-300 mt-0.5">{catalogBooks.length}</div>
            </div>
          </div>

          {/* Action Row: Add New Book to Catalog Button */}
          <div className="p-4 bg-gradient-to-r from-orange-950/40 via-amber-950/20 to-stone-900 border border-orange-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-orange-600 text-white shrink-0 shadow-lg shadow-orange-600/30">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-zinc-200">
                  Tambah Buku Baru ke Katalog Publik
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Upload file PDF, DOCX, atau EPUB Anda. Sistem akan membuat bab dan menerbitkannya untuk semua pembaca.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenUploadCatalog();
              }}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-orange-600/20 shrink-0 cursor-pointer"
            >
              <Plus size={14} />
              <span>Unggah Buku Sekarang</span>
            </button>
          </div>

          {/* Tabs: Custom Added vs All Catalog */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'custom'
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Buku yang Diunggah Pemilik ({catalogBooks.length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Semua Koleksi Platform ({allCatalogBooks.length})
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-zinc-400">Akses Admin:</span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-emerald-950 text-emerald-300 border-emerald-800">
                ✓ Terverifikasi UID
              </span>
            </div>
          </div>

          {/* Catalog Books List */}
          {activeTab === 'custom' ? (
            catalogBooks.length === 0 ? (
              <div className="py-12 text-center bg-stone-900/40 border border-dashed border-stone-800 rounded-2xl p-6">
                <BookOpen size={36} className="mx-auto text-zinc-600 mb-2" />
                <h4 className="text-xs font-semibold text-zinc-300">Belum Ada Buku Tambahan dari Pemilik</h4>
                <p className="text-[11px] text-zinc-500 max-w-sm mx-auto mt-1 mb-4">
                  Klik tombol "Unggah Buku Sekarang" di atas untuk menambahkan buku PDF/DOCX/EPUB Anda ke katalog utama.
                </p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenUploadCatalog();
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Unggah Buku Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {catalogBooks.map((b) => (
                  <div
                    key={b.id}
                    className="p-4 bg-stone-900/90 border border-stone-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:border-stone-700 transition-colors"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-11 h-14 rounded-xl bg-gradient-to-br ${b.coverColor} flex items-center justify-center shrink-0 shadow`}>
                        <BookOpen className="w-5 h-5 text-white/80" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-bold text-zinc-200 truncate">{b.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            b.isPremium
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                          }`}>
                            {b.isPremium ? 'VIP Premium' : 'Gratis'}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{b.author} · {b.category}</p>
                        <div className="flex items-center space-x-3 text-[10px] text-zinc-500 mt-1">
                          <span>{b.chapters.length} Bab</span>
                          <span>·</span>
                          <span>~{b.readTimeMinutes} Menit</span>
                          {b.fileType && (
                            <>
                              <span>·</span>
                              <span className="uppercase text-orange-400">{b.fileType}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleToggleVip(b)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-colors cursor-pointer ${
                          b.isPremium
                            ? 'bg-amber-950/60 border-amber-800 text-amber-300 hover:bg-amber-900/60'
                            : 'bg-stone-800 border-stone-700 text-zinc-300 hover:text-white'
                        }`}
                        title="Ubah status akses buku"
                      >
                        <Crown size={12} className={b.isPremium ? 'text-amber-400' : 'text-zinc-500'} />
                        <span>{b.isPremium ? 'Ubah ke Gratis' : 'Jadikan VIP'}</span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onSelectBook(b);
                        }}
                        className="p-2 text-zinc-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                        title="Buka dan Pratinjau di Reader"
                      >
                        <Eye size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus "${b.title}" dari katalog publik?`)) {
                            deleteCatalogBook(b.id);
                          }
                        }}
                        className="p-2 text-zinc-500 hover:text-rose-400 rounded-xl bg-stone-800 hover:bg-rose-950 transition-colors cursor-pointer"
                        title="Hapus buku"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              {allCatalogBooks.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 bg-stone-900/70 border border-stone-800 rounded-2xl flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-8 h-10 rounded-lg bg-gradient-to-br ${b.coverColor} flex items-center justify-center shrink-0`}>
                      <BookOpen className="w-3.5 h-3.5 text-white/80" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-zinc-200 truncate">{b.title}</div>
                      <div className="text-[10px] text-zinc-400 truncate">{b.author}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      b.isPremium
                        ? 'bg-amber-950 text-amber-400 border border-amber-800/80'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-800/80'
                    }`}>
                      {b.isPremium ? 'VIP' : 'Gratis'}
                    </span>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectBook(b);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-zinc-300 text-[11px] cursor-pointer"
                    >
                      Baca
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-[#0e0f14] flex items-center justify-between text-xs text-zinc-500">
          <span>Perubahan pada katalog tersinkronisasi ke Firestore Cloud secara real-time.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-zinc-200 rounded-xl transition-colors cursor-pointer"
          >
            Tutup Panel
          </button>
        </div>
      </div>
    </div>
  );
};

