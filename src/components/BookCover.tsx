import React from 'react';
import { Book } from '../types';
import { 
  Cpu, 
  Crown, 
  TrendingUp, 
  Sparkles, 
  Brain, 
  Compass, 
  Shield, 
  Zap, 
  BookOpen 
} from 'lucide-react';

interface BookCoverProps {
  book: Book;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  shadow?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  book,
  size = 'md',
  className = '',
  shadow = true
}) => {
  const sizeClasses = {
    xs: 'w-12 h-16 text-[8px]',
    sm: 'w-20 h-28 text-[10px]',
    md: 'w-32 h-44 text-xs',
    lg: 'w-44 h-60 text-sm',
    xl: 'w-56 h-76 text-base'
  };

  const getIcon = () => {
    const iconSize = size === 'xs' ? 12 : size === 'sm' ? 16 : size === 'md' ? 24 : 32;
    switch (book.coverIcon) {
      case 'circuit':
      case 'cpu':
        return <Cpu size={iconSize} className="opacity-80" />;
      case 'crown':
        return <Crown size={iconSize} className="opacity-80 text-amber-400" />;
      case 'trending-up':
        return <TrendingUp size={iconSize} className="opacity-80 text-red-400" />;
      case 'sparkles':
      case 'sparkle':
        return <Sparkles size={iconSize} className="opacity-80 text-sky-400" />;
      case 'brain':
        return <Brain size={iconSize} className="opacity-80 text-purple-400" />;
      case 'compass':
        return <Compass size={iconSize} className="opacity-80 text-blue-400" />;
      case 'shield':
        return <Shield size={iconSize} className="opacity-80 text-indigo-400" />;
      case 'zap':
        return <Zap size={iconSize} className="opacity-80 text-rose-400" />;
      default:
        return <BookOpen size={iconSize} className="opacity-80" />;
    }
  };

  return (
    <div
      className={`relative rounded-md overflow-hidden flex flex-col justify-between p-3 select-none transition-transform duration-300 ${sizeClasses[size]} ${shadow ? 'shadow-xl shadow-black/50' : ''} ${className}`}
      style={{
        backgroundColor: book.coverColor || '#18181b',
        borderLeft: '4px solid rgba(255,255,255,0.15)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(0,0,0,0.4)',
      }}
    >
      {/* Spine glow effect */}
      <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-r from-black/40 via-white/10 to-transparent pointer-events-none" />

      {/* Decorative gradient overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${book.coverAccent} 0%, transparent 70%)`
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span 
          className="font-mono text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
          style={{
            color: book.coverAccent,
            backgroundColor: 'rgba(0,0,0,0.4)'
          }}
        >
          {book.category.split('&')[0].trim()}
        </span>
        <div style={{ color: book.coverAccent }}>{getIcon()}</div>
      </div>

      {/* Center artwork / motif */}
      <div className="relative z-10 my-auto flex flex-col items-center justify-center text-center">
        {book.id === 'competing-in-the-age-of-ai' && (
          <div className="w-12 h-12 rounded-full border border-emerald-500/40 flex items-center justify-center bg-emerald-950/30 mb-1">
            <div className="w-6 h-6 rounded-full bg-emerald-500/30 animate-pulse" />
          </div>
        )}
        {book.id === '48-laws-of-power' && (
          <div className="w-12 h-12 rounded-full border-2 border-amber-500/60 flex items-center justify-center mb-1">
            <span className="font-serif font-bold text-amber-400 text-sm">48</span>
          </div>
        )}
      </div>

      {/* Bottom Title & Author */}
      <div className="relative z-10 mt-auto">
        <h4 
          className="font-serif font-bold leading-tight line-clamp-2 text-zinc-100"
          style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
          }}
        >
          {book.title}
        </h4>
        <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-medium">
          {book.author}
        </p>
      </div>

      {/* Paper texture overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none" />
    </div>
  );
};
