import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Check, 
  X, 
  AlertCircle, 
  Sparkles, 
  BookOpen, 
  Clock, 
  Layers, 
  Lock, 
  Globe, 
  ArrowRight,
  Palette,
  Loader2,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Book } from '../types';
import { 
  parseUploadedDocument, 
  ParsedDocumentResult, 
  createF15BookFromUpload 
} from '../utils/documentParser';

interface UploadBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: 'personal' | 'catalog';
  onSelectBook?: (book: Book) => void;
  onOpenSubscriptionModal?: (reason?: string) => void;
}

const CATEGORIES = [
  'Bisnis & Manajemen',
  'Pengembangan Diri',
  'Teknologi & AI',
  'Filosofi & Kebijaksanaan',
  'Keuangan & Investasi',
  'Sains & Masa Depan',
  'Psikologi',
  'Sastra & Fiksi',
  'Buku Pribadi'
];

const COLOR_PALETTES = [
  { name: 'Amber Glow', class: 'from-amber-600 via-stone-800 to-black', hex: '#d97706' },
  { name: 'Emerald Forest', class: 'from-emerald-700 via-teal-900 to-stone-950', hex: '#059669' },
  { name: 'Royal Indigo', class: 'from-indigo-700 via-purple-950 to-stone-950', hex: '#4f46e5' },
  { name: 'Deep Cyan', class: 'from-blue-700 via-cyan-950 to-stone-950', hex: '#0284c7' },
  { name: 'Velvet Rose', class: 'from-rose-700 via-red-950 to-stone-950', hex: '#e11d48' },
  { name: 'Sunset Bronze', class: 'from-orange-600 via-amber-950 to-stone-950', hex: '#ea580c' }
];

export const UploadBookModal: React.FC<UploadBookModalProps> = ({
  isOpen,
  onClose,
  target = 'personal',
  onSelectBook,
  onOpenSubscriptionModal
}) => {
  const { 
    isVip, 
    customBooks, 
    canUploadMoreCustomBooks, 
    maxFreeUploads, 
    addCustomBook, 
    addCatalogBook,
    isAdminMode 
  } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseStatus, setParseStatus] = useState<'idle' | 'parsing' | 'preview' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted and editable metadata
  const [parsedDoc, setParsedDoc] = useState<ParsedDocumentResult | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTES[0].class);
  const [isPremiumForCatalog, setIsPremiumForCatalog] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'personal' | 'catalog'>(target);
  const [savedCreatedBook, setSavedCreatedBook] = useState<Book | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setParseStatus('idle');
    setParsedDoc(null);
    setErrorMessage(null);
    setSavedCreatedBook(null);
  };

  const handleFileProcess = async (file: File) => {
    // Check personal upload quota for free tier
    if (uploadTarget === 'personal' && !canUploadMoreCustomBooks) {
      if (onOpenSubscriptionModal) {
        onOpenSubscriptionModal(`Anda telah menggunakan ${customBooks.length}/${maxFreeUploads} kuota unggah buku gratis. Upgrade ke VIP untuk unggah tanpa batas!`);
      }
      return;
    }

    setParseStatus('parsing');
    setErrorMessage(null);

    try {
      const result = await parseUploadedDocument(file);
      setParsedDoc(result);
      setTitle(result.title);
      setAuthor(result.author);
      setCategory(uploadTarget === 'personal' ? 'Buku Pribadi' : 'Pengembangan Diri');
      setParseStatus('preview');
    } catch (err: any) {
      console.error('Error parsing document:', err);
      setErrorMessage(err.message || 'Gagal memproses file. Pastikan dokumen memiliki teks digital.');
      setParseStatus('error');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleSaveBook = async () => {
    if (!parsedDoc) return;

    const newBook = createF15BookFromUpload(parsedDoc, {
      customCoverColor: selectedColor,
      title: title.trim() || parsedDoc.title,
      author: author.trim() || parsedDoc.author,
      category,
      isPremium: uploadTarget === 'catalog' ? isPremiumForCatalog : false,
      uploadedBy: uploadTarget === 'catalog' ? 'admin' : 'user'
    });

    if (uploadTarget === 'catalog') {
      await addCatalogBook(newBook);
    } else {
      await addCustomBook(newBook);
    }

    setSavedCreatedBook(newBook);
    setParseStatus('success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#121319] border border-stone-800 rounded-3xl shadow-2xl overflow-hidden text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-stone-800/80">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-white tracking-wide">
                {uploadTarget === 'catalog' ? 'Tambah Buku ke Katalog Publik' : 'Unggah Buku Pribadi'}
              </h2>
              <p className="text-xs text-zinc-400">
                Format didukung: <span className="text-zinc-200 font-semibold">PDF, DOCX, EPUB</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Target Switcher if Admin */}
          {isAdminMode && parseStatus === 'idle' && (
            <div className="flex rounded-xl bg-stone-900/80 p-1 border border-stone-800">
              <button
                type="button"
                onClick={() => setUploadTarget('personal')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  uploadTarget === 'personal'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Unggah ke Buku Saya (Pribadi)
              </button>
              <button
                type="button"
                onClick={() => setUploadTarget('catalog')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  uploadTarget === 'catalog'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                👑 Terbitkan ke Katalog Publik (Admin)
              </button>
            </div>
          )}

          {/* Quota Banner for Free Customers */}
          {uploadTarget === 'personal' && !isVip && (
            <div className="p-3.5 rounded-2xl bg-stone-900/70 border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-zinc-300">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Kuota Unggah Gratis: <strong className="text-white">{customBooks.length} / {maxFreeUploads}</strong> buku
                </span>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenSubscriptionModal) onOpenSubscriptionModal('Upgrade ke VIP untuk membuka kuota unggah buku tanpa batas!');
                }}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline cursor-pointer"
              >
                Upgrade VIP (Tanpa Batas)
              </button>
            </div>
          )}

          {/* STEP 1: DROPZONE IDLE */}
          {parseStatus === 'idle' && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-stone-800 hover:border-orange-500/50 bg-[#161720]/50 hover:bg-[#161720]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.epub,.txt,.md"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto mb-4 text-orange-400 shadow-md">
                <Upload className="w-7 h-7" />
              </div>

              <h3 className="text-sm font-semibold text-zinc-200 mb-1">
                Tarik file buku ke sini, atau klik untuk memilih
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                Sistem akan mengekstrak judul, bab per 15 menit, dan estimasi waktu baca secara otomatis.
              </p>

              <div className="inline-flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-[11px] font-mono font-medium text-rose-300 border border-stone-800">
                  .PDF
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-[11px] font-mono font-medium text-blue-300 border border-stone-800">
                  .DOCX
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-stone-900 text-[11px] font-mono font-medium text-emerald-300 border border-stone-800">
                  .EPUB
                </span>
              </div>
            </div>
          )}

          {/* STEP 2: PARSING LOADER */}
          {parseStatus === 'parsing' && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">
                  Sedang Memproses Dokumen...
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                  Mengekstrak teks, bab terstruktur, dan metadata dokumen Anda.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & CUSTOMIZE */}
          {parseStatus === 'preview' && parsedDoc && (
            <div className="space-y-4 animate-fadeIn">
              {/* Extraction Stat Summary */}
              <div className="p-3.5 bg-stone-900/90 border border-stone-800 rounded-2xl flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <Check className="w-4 h-4" />
                  <span className="font-semibold">Ekstraksi Berhasil ({parsedDoc.fileType.toUpperCase()})</span>
                </div>
                <div className="flex items-center space-x-3 text-zinc-400 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Layers size={13} /> {parsedDoc.chapters.length} Bab
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> ~{parsedDoc.estimatedReadTimeMinutes} Menit
                  </span>
                </div>
              </div>

              {/* Form Metadata */}
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                    Judul Buku / Dokumen
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                    placeholder="Judul buku"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Penulis
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-zinc-100 focus:outline-none focus:border-orange-500"
                      placeholder="Nama penulis"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                      Kategori Topik
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-orange-500 cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Color Palette Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Palette size={13} /> Warna Sampul
                  </label>
                  <div className="flex items-center space-x-2">
                    {COLOR_PALETTES.map((palette) => (
                      <button
                        key={palette.name}
                        type="button"
                        onClick={() => setSelectedColor(palette.class)}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          selectedColor === palette.class ? 'scale-115 border-white ring-2 ring-orange-500/50' : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: palette.hex }}
                        title={palette.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Admin Access Gating Option */}
                {uploadTarget === 'catalog' && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5" /> Akses Khusus Member VIP
                      </div>
                      <div className="text-[11px] text-zinc-400">
                        {isPremiumForCatalog
                          ? 'Pengguna Free hanya bisa membaca 2 bab pertama sampel gratis.'
                          : 'Buku ini gratis dan terbuka untuk semua pengguna.'}
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isPremiumForCatalog}
                        onChange={(e) => setIsPremiumForCatalog(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS CONFIRMATION */}
          {parseStatus === 'success' && savedCreatedBook && (
            <div className="text-center py-6 space-y-4 animate-fadeIn">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                <Check className="w-7 h-7 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-base font-bold font-serif text-white">
                  Buku Berhasil Ditambahkan! 🎉
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  "{savedCreatedBook.title}" kini telah tersimpan dan siap dibaca di F15 Reader.
                </p>
              </div>

              <div className="p-3.5 bg-stone-900 border border-stone-800 rounded-2xl max-w-sm mx-auto text-left flex items-center space-x-3">
                <div className={`w-10 h-13 rounded-lg bg-gradient-to-br ${savedCreatedBook.coverColor} flex items-center justify-center shrink-0 shadow`}>
                  <BookOpen className="w-4 h-4 text-white/80" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-zinc-200 truncate">{savedCreatedBook.title}</div>
                  <div className="text-[11px] text-zinc-400 truncate">{savedCreatedBook.author}</div>
                  <div className="text-[10px] text-orange-400 mt-0.5">{savedCreatedBook.chapters.length} Bab · {savedCreatedBook.readTimeMinutes} Menit Baca</div>
                </div>
              </div>
            </div>
          )}

          {/* ERROR DISPLAY */}
          {parseStatus === 'error' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 flex items-start space-x-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-rose-300 block mb-1">Gagal Mengekstrak Dokumen</span>
                <p className="text-rose-200/90 leading-relaxed">{errorMessage}</p>
                <button
                  onClick={handleReset}
                  className="mt-3 px-3 py-1 bg-rose-900/60 hover:bg-rose-900 text-rose-200 rounded-lg text-[11px] font-semibold transition-colors"
                >
                  Coba File Lain
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-stone-800 bg-[#0e0f14] flex items-center justify-between">
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {parseStatus === 'success' ? 'Tutup' : 'Batal'}
          </button>

          {parseStatus === 'preview' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3.5 py-2 text-xs text-zinc-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
              >
                Ganti File
              </button>
              <button
                onClick={handleSaveBook}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-orange-600/20 transition-all cursor-pointer"
              >
                <span>Simpan Buku</span>
                <Check size={14} />
              </button>
            </div>
          )}

          {parseStatus === 'success' && savedCreatedBook && (
            <button
              onClick={() => {
                if (onSelectBook) {
                  onSelectBook(savedCreatedBook);
                }
                handleReset();
                onClose();
              }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <span>Mulai Baca Sekarang</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

