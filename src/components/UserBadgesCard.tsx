import React, { useState, useMemo } from 'react';
import { 
  Award, 
  Moon, 
  Zap, 
  Sun, 
  Flame, 
  Trophy, 
  CheckCircle2, 
  Highlighter, 
  Compass, 
  Coffee, 
  Share2, 
  Lock, 
  Sparkles, 
  Check, 
  X, 
  ChevronRight, 
  Star
} from 'lucide-react';
import { UserBadge } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  evaluateAndComputeBadges, 
  saveBadgeUnlock, 
  getSavedBadgeUnlocks 
} from '../utils/badgeUtils';

interface UserBadgesCardProps {
  className?: string;
  onExplore?: () => void;
}

export const UserBadgesCard: React.FC<UserBadgesCardProps> = ({
  className = ''
}) => {
  const { readingHistory, annotations, goalProgress, readingStats } = useAuth();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unlocked' | 'locked' | 'time' | 'speed'>('all');
  const [selectedBadge, setSelectedBadge] = useState<UserBadge | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [customUnlocksVersion, setCustomUnlocksVersion] = useState<number>(0);

  // Compute badges list
  const { badges } = useMemo(() => {
    return evaluateAndComputeBadges(
      readingHistory,
      annotations,
      goalProgress,
      readingStats.completedCount,
      getSavedBadgeUnlocks()
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readingHistory, annotations, goalProgress, readingStats.completedCount, customUnlocksVersion]);

  const unlockedCount = useMemo(() => badges.filter(b => b.unlocked).length, [badges]);
  const totalCount = badges.length;
  const unlockedPercent = Math.round((unlockedCount / totalCount) * 100);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter(b => {
      if (activeFilter === 'unlocked') return b.unlocked;
      if (activeFilter === 'locked') return !b.unlocked;
      if (activeFilter === 'time') return b.category === 'time';
      if (activeFilter === 'speed') return b.category === 'speed';
      return true;
    });
  }, [badges, activeFilter]);

  // Helper to render icon component dynamically
  const renderBadgeIcon = (iconName: string, size = 20, isUnlocked = false) => {
    switch (iconName) {
      case 'Moon':
        return <Moon size={size} className={isUnlocked ? 'text-indigo-400 fill-indigo-400/20' : 'text-zinc-600'} />;
      case 'Zap':
        return <Zap size={size} className={isUnlocked ? 'text-amber-400 fill-amber-400/30' : 'text-zinc-600'} />;
      case 'Sun':
        return <Sun size={size} className={isUnlocked ? 'text-amber-400 fill-amber-400/20' : 'text-zinc-600'} />;
      case 'Flame':
        return <Flame size={size} className={isUnlocked ? 'text-orange-400 fill-orange-400' : 'text-zinc-600'} />;
      case 'Trophy':
        return <Trophy size={size} className={isUnlocked ? 'text-yellow-400 fill-yellow-400/20' : 'text-zinc-600'} />;
      case 'CheckCircle2':
        return <CheckCircle2 size={size} className={isUnlocked ? 'text-emerald-400 fill-emerald-400/20' : 'text-zinc-600'} />;
      case 'Highlighter':
        return <Highlighter size={size} className={isUnlocked ? 'text-emerald-400' : 'text-zinc-600'} />;
      case 'Compass':
        return <Compass size={size} className={isUnlocked ? 'text-sky-400' : 'text-zinc-600'} />;
      case 'Coffee':
        return <Coffee size={size} className={isUnlocked ? 'text-rose-400' : 'text-zinc-600'} />;
      case 'Share2':
        return <Share2 size={size} className={isUnlocked ? 'text-purple-400' : 'text-zinc-600'} />;
      default:
        return <Award size={size} className={isUnlocked ? 'text-orange-400' : 'text-zinc-600'} />;
    }
  };

  // Badge rarity styling
  const getRarityBadge = (rarity: UserBadge['rarity']) => {
    switch (rarity) {
      case 'epic':
        return {
          label: 'Epik',
          bg: 'bg-amber-950/60 text-amber-300 border-amber-700/50',
          glow: 'group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
        };
      case 'rare':
        return {
          label: 'Langka',
          bg: 'bg-indigo-950/60 text-indigo-300 border-indigo-700/50',
          glow: 'group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
        };
      case 'legendary':
        return {
          label: 'Legendaris',
          bg: 'bg-rose-950/60 text-rose-300 border-rose-700/50',
          glow: 'group-hover:shadow-[0_0_15px_rgba(244,63,94,0.2)]'
        };
      case 'common':
      default:
        return {
          label: 'Umum',
          bg: 'bg-stone-800/80 text-zinc-400 border-stone-700/60',
          glow: 'group-hover:shadow-[0_0_12px_rgba(161,161,170,0.1)]'
        };
    }
  };

  const handleSimulateUnlock = (badgeId: string) => {
    saveBadgeUnlock(badgeId);
    setCustomUnlocksVersion(prev => prev + 1);
    const target = badges.find(b => b.id === badgeId);
    setToastMessage(`🎉 Selamat! Lencana '${target?.name || badgeId}' berhasil dibuka!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-[#14151c] border border-stone-800 shadow-md ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white p-1 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header: Title & Unlocked Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <span>Lencana & Pencapaian</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Koleksi pencapaian membaca unik seperti <strong className="text-indigo-300 font-semibold">Night Owl</strong> dan <strong className="text-amber-300 font-semibold">Speed Reader</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Gauge */}
        <div className="sm:text-right bg-stone-900/80 p-3 rounded-xl border border-stone-800/80 sm:min-w-[200px]">
          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs mb-1.5">
            <span className="text-zinc-400">Pencapaian:</span>
            <span className="font-mono font-bold text-orange-400 text-sm">
              {unlockedCount} / {totalCount} ({unlockedPercent}%)
            </span>
          </div>
          <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-orange-500 to-amber-400 h-full rounded-full transition-all duration-700 shadow-xs"
              style={{ width: `${unlockedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="py-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-800/60">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900'
            }`}
          >
            Semua ({badges.length})
          </button>
          <button
            onClick={() => setActiveFilter('unlocked')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'unlocked'
                ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900'
            }`}
          >
            <CheckCircle2 size={12} className="text-emerald-400" />
            <span>Terbuka ({unlockedCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('locked')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'locked'
                ? 'bg-stone-800 text-zinc-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900'
            }`}
          >
            <Lock size={12} className="text-zinc-500" />
            <span>Terkunci ({totalCount - unlockedCount})</span>
          </button>
          <button
            onClick={() => setActiveFilter('time')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'time'
                ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900'
            }`}
          >
            <Moon size={12} className="text-indigo-400" />
            <span>Waktu Khusus</span>
          </button>
          <button
            onClick={() => setActiveFilter('speed')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeFilter === 'speed'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-stone-900'
            }`}
          >
            <Zap size={12} className="text-amber-400" />
            <span>Kecepatan</span>
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 hidden md:inline">
          Klik pada lencana untuk melihat panduan cara membuka
        </span>
      </div>

      {/* Badges Grid */}
      <div className="pt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const rarityConfig = getRarityBadge(badge.rarity);
          const isHighlightRequested = badge.id === 'night-owl' || badge.id === 'speed-reader';

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={`group relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                rarityConfig.glow
              } ${
                badge.unlocked
                  ? isHighlightRequested
                    ? 'bg-gradient-to-b from-[#181a24] to-[#12131a] border-orange-500/40 shadow-sm hover:border-orange-400'
                    : 'bg-stone-900/70 border-stone-700/80 hover:border-stone-600'
                  : 'bg-stone-900/30 border-stone-800/70 opacity-75 hover:opacity-100 hover:border-stone-700'
              }`}
            >
              <div>
                {/* Badge Top: Icon + Rarity Tag */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                    badge.unlocked
                      ? badge.id === 'night-owl'
                        ? 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.25)]'
                        : badge.id === 'speed-reader'
                        ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                        : 'bg-stone-800 border-stone-700 text-orange-400'
                      : 'bg-stone-800/70 border-stone-700/60 text-zinc-600'
                  }`}>
                    {renderBadgeIcon(badge.icon, 22, badge.unlocked)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {badge.unlocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                        <Check size={10} className="text-emerald-400" />
                        <span>Terbuka</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-zinc-500">
                        <Lock size={10} />
                        <span>Terkunci</span>
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${rarityConfig.bg}`}>
                      {rarityConfig.label}
                    </span>
                  </div>
                </div>

                {/* Badge Titles */}
                <div className="space-y-0.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-zinc-100 group-hover:text-orange-400 transition-colors">
                      {badge.name}
                    </h4>
                    {isHighlightRequested && (
                      <Sparkles size={13} className="text-amber-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-orange-300/90">
                    {badge.nameId}
                  </p>
                </div>

                {/* Badge Description */}
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mt-1">
                  {badge.description}
                </p>
              </div>

              {/* Badge Footer: Unlocked Date or Progress */}
              <div className="pt-3 mt-3 border-t border-stone-800/80 text-[11px]">
                {badge.unlocked ? (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-emerald-400 font-medium flex items-center gap-1">
                      <Star size={11} className="fill-emerald-400/30 text-emerald-400" />
                      <span>{badge.unlockedAt ? `Dibuka: ${badge.unlockedAt}` : 'Pencapaian Terbuka'}</span>
                    </span>
                    <span className="text-zinc-500 text-[10px] group-hover:text-orange-400 transition-colors">Detail &rarr;</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-zinc-400 text-[10px]">
                      <span>Kemajuan</span>
                      <span className="font-mono text-zinc-300">
                        {badge.currentProgress} / {badge.targetProgress} {badge.progressUnit}
                      </span>
                    </div>
                    <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-stone-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, Math.round((badge.currentProgress / badge.targetProgress) * 100))}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Badge Detail Modal */}
      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedBadge(null)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-[#171821] border border-stone-700 shadow-2xl p-6 text-zinc-100 space-y-5 animate-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Badge Identity */}
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shrink-0 ${
                selectedBadge.unlocked
                  ? 'bg-gradient-to-br from-orange-500/20 to-amber-500/10 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                  : 'bg-stone-800 border-stone-700 text-zinc-600'
              }`}>
                {renderBadgeIcon(selectedBadge.icon, 32, selectedBadge.unlocked)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-zinc-100">
                    {selectedBadge.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getRarityBadge(selectedBadge.rarity).bg}`}>
                    {getRarityBadge(selectedBadge.rarity).label}
                  </span>
                </div>
                <p className="text-xs font-semibold text-orange-400">
                  {selectedBadge.nameId}
                </p>
                <div className="pt-0.5">
                  {selectedBadge.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 size={13} /> Terbuka ({selectedBadge.unlockedAt || 'Baru Saja'})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400">
                      <Lock size={13} /> Belum Terbuka
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description & Criteria */}
            <div className="p-4 rounded-xl bg-stone-900/80 border border-stone-800 space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                  Deskripsi Lencana
                </span>
                <p className="text-zinc-200 leading-relaxed">
                  {selectedBadge.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                  Syarat Pencapaian
                </span>
                <p className="text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                  <ChevronRight size={13} className="text-orange-400 shrink-0 mt-0.5" />
                  <span>{selectedBadge.criteria}</span>
                </p>
              </div>
            </div>

            {/* Progress & Testing Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              {!selectedBadge.unlocked ? (
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Kemajuan Kamu</span>
                    <span className="font-mono text-zinc-200">
                      {selectedBadge.currentProgress} / {selectedBadge.targetProgress} {selectedBadge.progressUnit}
                    </span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-orange-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, Math.round((selectedBadge.currentProgress / selectedBadge.targetProgress) * 100))}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-xs text-emerald-300 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-emerald-400" />
                  <span>Lencana ini terpasang di profil pembaca F15 kamu.</span>
                </div>
              )}
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-800">
              {/* Optional test unlock button so the user can easily test either Night Owl or Speed Reader */}
              {!selectedBadge.unlocked ? (
                <button
                  onClick={() => {
                    handleSimulateUnlock(selectedBadge.id);
                    setSelectedBadge(prev => prev ? { ...prev, unlocked: true, unlockedAt: 'Hari ini' } : null);
                  }}
                  className="text-[11px] text-zinc-400 hover:text-orange-300 underline cursor-pointer py-1"
                  title="Buka lencana ini untuk tujuan verifikasi dan demonstrasi"
                >
                  Buka Lencana Sekarang (Simulasi)
                </button>
              ) : (
                <span className="text-[11px] text-zinc-500">
                  Lencana resmi F15 Library
                </span>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-100 text-xs font-semibold cursor-pointer ml-auto"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
