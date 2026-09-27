import React from 'react';
import { X, Type, Palette, AlignLeft, Check, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ReaderFontSize, ReaderFontFamily, ReaderLineHeight, ReaderTheme } from '../types';

interface ReaderCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReaderCustomizerModal: React.FC<ReaderCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize, 
    fontFamily, 
    setFontFamily, 
    lineHeight, 
    setLineHeight 
  } = useTheme();

  if (!isOpen) return null;

  const themes: { id: ReaderTheme; label: string; bg: string; text: string; border: string }[] = [
    { id: 'dark', label: 'Obsidian', bg: '#0d0e12', text: '#e4e4e7', border: '#27272a' },
    { id: 'sepia', label: 'Sepia', bg: '#fbf0d9', text: '#2d261e', border: '#e4d3af' },
    { id: 'cream', label: 'Krem', bg: '#f5edd6', text: '#2b2319', border: '#d8c7a6' },
    { id: 'sage', label: 'Sage', bg: '#15221c', text: '#e0ece5', border: '#23382f' },
    { id: 'midnight', label: 'Midnight', bg: '#0a1128', text: '#e2e8f0', border: '#1e293b' },
    { id: 'light', label: 'Terang', bg: '#fafafa', text: '#18181b', border: '#e4e4e7' }
  ];

  const fonts: { id: ReaderFontFamily; label: string; fontClass: string; desc: string }[] = [
    { id: 'newsreader', label: 'Newsreader', fontClass: 'font-newsreader', desc: 'Serif klasik editorial' },
    { id: 'literata', label: 'Literata', fontClass: 'font-literata', desc: 'Didesain khusus buku digital' },
    { id: 'merriweather', label: 'Merriweather', fontClass: 'font-merriweather', desc: 'Serif hangat & ramah baca' },
    { id: 'jakarta', label: 'Jakarta Sans', fontClass: 'font-jakarta', desc: 'Sans-serif modern presisi' },
    { id: 'mono', label: 'JetBrains Mono', fontClass: 'font-mono-reader', desc: 'Monospace rapi untuk analisa' }
  ];

  const fontSizes: { id: ReaderFontSize; label: string; px: string }[] = [
    { id: 'xs', label: 'XS', px: '14px' },
    { id: 'small', label: 'S', px: '16px' },
    { id: 'standard', label: 'M', px: '18px' },
    { id: 'large', label: 'L', px: '20px' },
    { id: 'xl', label: 'XL', px: '24px' }
  ];

  const lineHeights: { id: ReaderLineHeight; label: string }[] = [
    { id: 'compact', label: 'Rapat' },
    { id: 'standard', label: 'Normal' },
    { id: 'relaxed', label: 'Renggang' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#14151b] border border-stone-700 rounded-3xl shadow-2xl p-6 text-zinc-100 space-y-6 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Type size={16} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-zinc-100">
                Kustomisasi Tampilan Baca
              </h3>
              <p className="text-[11px] text-zinc-400">
                Sesuaikan font, latar belakang, dan kenyamanan mata Anda.
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

        {/* 1. Warna Latar Belakang Buku */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Palette size={14} className="text-orange-500" />
              <span>Warna Latar Belakang Buku</span>
            </label>
            <span className="text-[10px] text-zinc-400 capitalize">
              {themes.find(t => t.id === theme)?.label}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  style={{ backgroundColor: t.bg, color: t.text, borderColor: t.border }}
                  className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between transition-all duration-200 cursor-pointer shadow-sm ${
                    isSelected ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#14151b] scale-[1.02]' : 'hover:scale-[1.01]'
                  }`}
                >
                  <span className="font-semibold text-xs truncate">{t.label}</span>
                  {isSelected && <Check size={14} className="text-orange-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Jenis Font */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Type size={14} className="text-orange-500" />
            <span>Pilihan Jenis Font</span>
          </label>

          <div className="space-y-2">
            {fonts.map((f) => {
              const isSelected = fontFamily === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFontFamily(f.id)}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-orange-950/30 border-orange-500/50 text-orange-200'
                      : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800/80'
                  }`}
                >
                  <div>
                    <span className={`text-sm font-semibold block ${f.fontClass}`}>
                      {f.label}
                    </span>
                    <span className="text-[11px] text-zinc-400 opacity-80">
                      {f.desc}
                    </span>
                  </div>
                  {isSelected && <Check size={16} className="text-orange-500" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Ukuran Font */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300">
              Ukuran Font ({fontSizes.find(s => s.id === fontSize)?.px})
            </label>
            <span className="text-[11px] text-orange-400 font-mono">
              {fontSize.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 bg-stone-900 p-1.5 rounded-2xl border border-stone-800">
            {fontSizes.map((s) => (
              <button
                key={s.id}
                onClick={() => setFontSize(s.id)}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  fontSize === s.id
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-800/60'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Jarak Spasi Antar Baris (Line Height) */}
        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <AlignLeft size={14} className="text-orange-500" />
            <span>Spasi Antar Baris</span>
          </label>

          <div className="grid grid-cols-3 gap-2 bg-stone-900 p-1 rounded-xl border border-stone-800">
            {lineHeights.map((lh) => (
              <button
                key={lh.id}
                onClick={() => setLineHeight(lh.id)}
                className={`py-2 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  lineHeight === lh.id
                    ? 'bg-stone-800 text-orange-400 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lh.label}
              </button>
            ))}
          </div>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-2xl border border-stone-800 bg-stone-900/50 space-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 block">
            Pratinjau Langsung Teks Buku:
          </span>
          <p className={`italic ${
            fontFamily === 'newsreader' ? 'font-newsreader' :
            fontFamily === 'literata' ? 'font-literata' :
            fontFamily === 'merriweather' ? 'font-merriweather' :
            fontFamily === 'jakarta' ? 'font-jakarta' : 'font-mono-reader'
          } ${
            fontSize === 'xs' ? 'text-xs' :
            fontSize === 'small' ? 'text-sm' :
            fontSize === 'standard' ? 'text-base' :
            fontSize === 'large' ? 'text-lg' : 'text-xl'
          } ${
            lineHeight === 'compact' ? 'leading-tight' :
            lineHeight === 'standard' ? 'leading-relaxed' : 'leading-loose'
          } text-zinc-200`}>
            "Kecerdasan bukanlah kemampuan menghafal fakta, melainkan ketajaman bernalar dalam menghadapi ketidakpastian."
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl text-xs font-semibold transition-colors cursor-pointer shadow-md"
        >
          Selesai &amp; Terapkan
        </button>
      </div>
    </div>
  );
};
