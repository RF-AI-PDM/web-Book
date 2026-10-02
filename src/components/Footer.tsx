import React from 'react';
import { BookOpen, ShieldCheck, Award } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'collections' | 'my-books') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-stone-800/80 bg-[#0d0e12] py-12 text-zinc-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-stone-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-zinc-100">
              <div className="w-7 h-7 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
                <BookOpen size={16} />
              </div>
              <span className="font-serif font-bold text-base tracking-tight">
                F15 Library
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 max-w-sm">
              Baca koleksi buku PDF dan EPUB lengkap dengan anotasi interaktif dan sinkronisasi cloud perpustakaan pribadi.
            </p>
          </div>

          {/* Certifications matching Screenshot 4 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-zinc-300 text-[11px] font-mono">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>ISO 27001:2022</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 border border-stone-800 text-zinc-300 text-[11px] font-mono">
              <Award size={14} className="text-amber-500" />
              <span>ISO 9001:2015</span>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© 2026 F15 Library. Hak Cipta Dilindungi Undang-Undang.</p>
          <div className="flex items-center gap-5">
            <button onClick={() => onNavigate('home')} className="hover:text-zinc-300 cursor-pointer">
              Beranda
            </button>
            <button onClick={() => onNavigate('collections')} className="hover:text-zinc-300 cursor-pointer">
              Koleksi
            </button>
            <button onClick={() => onNavigate('my-books')} className="hover:text-zinc-300 cursor-pointer">
              Buku Saya
            </button>
            <span className="hover:text-zinc-300">Privasi &amp; Keamanan</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
