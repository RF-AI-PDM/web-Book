import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Award, 
  Calendar, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ChevronRight, 
  Trophy, 
  Zap, 
  ShieldCheck, 
  Info, 
  Plus, 
  BookOpen, 
  Lock, 
  Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  getStreakHistory, 
  getStreakMilestones, 
  StreakDayHistory, 
  StreakMilestone 
} from '../utils/readingGoalUtils';

interface ReadingStreakCardProps {
  onStartReading?: () => void;
  className?: string;
}

export const ReadingStreakCard: React.FC<ReadingStreakCardProps> = ({
  onStartReading,
  className = ''
}) => {
  const { readingGoal, dailyReadingLogs, goalProgress, recordReadingMinutes } = useAuth();

  const [selectedDay, setSelectedDay] = useState<StreakDayHistory | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'milestones'>('calendar');

  // Streak history over the last 28 days (4 weeks)
  const streakHistory = useMemo(() => {
    return getStreakHistory(dailyReadingLogs, readingGoal.targetMinutesPerDay, 28);
  }, [dailyReadingLogs, readingGoal.targetMinutesPerDay]);

  // Streak milestone tiers
  const streakMilestonesData = useMemo(() => {
    return getStreakMilestones(goalProgress.currentStreak);
  }, [goalProgress.currentStreak]);

  // Total days goal achieved all time
  const totalDaysAchieved = useMemo(() => {
    const target = readingGoal.targetMinutesPerDay || 15;
    return Object.values(dailyReadingLogs).filter(m => (Number(m) || 0) >= target).length;
  }, [dailyReadingLogs, readingGoal.targetMinutesPerDay]);

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-[#14151c] border border-stone-800 shadow-md ${className}`}>
      {/* Top Banner: Flame Badge & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-5 border-b border-stone-800/80">
        <div className="flex items-start sm:items-center gap-4">
          {/* Animated Flame Icon Container */}
          <div className="relative shrink-0">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
              goalProgress.currentStreak > 0
                ? 'bg-gradient-to-br from-amber-500/20 via-orange-600/25 to-rose-600/20 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.25)]'
                : 'bg-stone-900 border-stone-800 text-zinc-500'
            }`}>
              <Flame 
                size={32} 
                className={`transition-all duration-300 ${
                  goalProgress.currentStreak > 0
                    ? 'text-amber-400 fill-amber-500 animate-pulse'
                    : 'text-zinc-600'
                }`} 
              />
            </div>
            {goalProgress.currentStreak > 0 && (
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-mono font-black text-[10px] shadow-sm">
                ACTIVE
              </span>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
                <span>{goalProgress.currentStreak} Hari Beruntun</span>
              </h3>

              {streakMilestonesData.currentTier && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-950/70 text-orange-300 border border-orange-700/50">
                  <Award size={12} className="text-orange-400" />
                  <span>{streakMilestonesData.currentTier.title}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-2 flex-wrap">
              <span>Target: <strong className="text-zinc-200">{readingGoal.targetMinutesPerDay} mnt/hari</strong></span>
              <span className="text-stone-700">•</span>
              <span>Rekor Terbaik: <strong className="text-amber-400 font-bold">{goalProgress.longestStreak} hari</strong></span>
              <span className="text-stone-700">•</span>
              <span>Total Sukses: <strong className="text-emerald-400 font-bold">{totalDaysAchieved} hari</strong></span>
            </p>
          </div>
        </div>

        {/* Status Callout & Quick Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className={`p-3 rounded-xl border text-xs max-w-sm ${
            goalProgress.isTodayAchieved
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
              : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
          }`}>
            {goalProgress.isTodayAchieved ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                <span>
                  <strong>Target hari ini tuntas!</strong> Api streak-mu tetap menyala terang untuk besok.
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-amber-400 shrink-0" />
                <span>
                  <strong>Sisa {goalProgress.todayRemainingMinutes} menit lagi.</strong> Baca sekarang agar streak tidak padam!
                </span>
              </div>
            )}
          </div>

          {onStartReading && !goalProgress.isTodayAchieved && (
            <button
              onClick={onStartReading}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <BookOpen size={14} />
              <span>Lanjut Baca</span>
            </button>
          )}
        </div>
      </div>

      {/* Milestone Progress Bar */}
      {streakMilestonesData.nextTier && (
        <div className="py-4 border-b border-stone-800/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Trophy size={13} className="text-amber-400" />
              <span>Target Berikutnya: <strong className="text-zinc-200">{streakMilestonesData.nextTier.title}</strong> ({streakMilestonesData.nextTier.days} Hari)</span>
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono">
              {streakMilestonesData.daysToNextTier} hari lagi ({streakMilestonesData.progressToNextTierPercent}%)
            </span>
          </div>

          <div className="w-full bg-stone-900 border border-stone-800 h-2.5 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-all duration-700"
              style={{ width: `${Math.min(100, Math.max(5, streakMilestonesData.progressToNextTierPercent))}%` }}
            />
          </div>
        </div>
      )}

      {/* Navigation Sub-Tabs: Visual 28-Day Grid vs Milestones Shelf */}
      <div className="pt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Visual 28 Hari
          </button>
          <button
            onClick={() => setActiveTab('milestones')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-stone-800 text-orange-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lencana Pencapaian ({streakMilestonesData.milestones.filter(m => m.unlocked).length}/{streakMilestonesData.milestones.length})
          </button>
        </div>

        <span className="text-[11px] text-zinc-500 hidden sm:inline">
          {activeTab === 'calendar' ? 'Setiap kotak mewakili 1 hari membaca' : 'Buka lencana konsistensi baru'}
        </span>
      </div>

      {/* TAB CONTENT: 28-Day Visual Streak Grid */}
      {activeTab === 'calendar' && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold flex items-center gap-1.5">
              <Calendar size={13} className="text-orange-400" />
              <span>Riwayat Konsistensi 4 Minggu Terakhir</span>
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" /> Target Tercapai
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-orange-600/70 inline-block" /> Parsial
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-stone-800 inline-block" /> Belum Baca
              </span>
            </div>
          </div>

          {/* 28-day heat-map grid (7 columns x 4 weeks) */}
          <div className="p-3 sm:p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {/* Day headers */}
              {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map((d, idx) => (
                <span key={idx} className="text-[10px] font-semibold text-zinc-500 pb-1">
                  {d}
                </span>
              ))}

              {/* Day blocks */}
              {streakHistory.map((day) => {
                const isSelected = selectedDay?.date === day.date;
                
                return (
                  <button
                    key={day.date}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`relative p-2 sm:p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-between min-h-[58px] ${
                      isSelected
                        ? 'ring-2 ring-orange-500 border-transparent z-10'
                        : ''
                    } ${
                      day.targetMet
                        ? 'bg-emerald-950/50 border-emerald-700/60 hover:bg-emerald-900/60 shadow-xs'
                        : day.minutes > 0
                        ? 'bg-orange-950/40 border-orange-800/50 hover:bg-orange-900/50'
                        : 'bg-stone-900/80 border-stone-800/80 hover:bg-stone-800/50 text-zinc-600'
                    } ${
                      day.isToday
                        ? 'ring-1 ring-amber-400/80 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[10px] font-mono leading-none ${
                        day.isToday ? 'font-bold text-amber-300' : 'text-zinc-400'
                      }`}>
                        {day.dayOfMonth}
                      </span>
                      {day.partOfCurrentStreak && (
                        <Flame size={11} className="text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="my-1">
                      {day.targetMet ? (
                        <Check size={13} className="text-emerald-400 font-bold" />
                      ) : (
                        <span className={`text-[9px] font-mono block ${
                          day.minutes > 0 ? 'text-orange-300' : 'text-zinc-600'
                        }`}>
                          {day.minutes > 0 ? `${day.minutes}m` : '—'}
                        </span>
                      )}
                    </div>

                    <span className="text-[8px] text-zinc-500 uppercase tracking-tighter">
                      {day.isToday ? 'Kini' : day.monthName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Details Card */}
          {selectedDay && (
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-700/80 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedDay.targetMet
                    ? 'bg-emerald-600/20 border border-emerald-500/40 text-emerald-400'
                    : selectedDay.minutes > 0
                    ? 'bg-orange-600/20 border border-orange-500/40 text-orange-400'
                    : 'bg-stone-800 text-zinc-500'
                }`}>
                  {selectedDay.targetMet ? (
                    <CheckCircle2 size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-zinc-200">
                    {selectedDay.dayFull}, {selectedDay.dayOfMonth} {selectedDay.monthName} {selectedDay.isToday ? '(Hari Ini)' : ''}
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Durasi: <strong className="text-zinc-100">{selectedDay.minutes} Menit</strong> dari target {selectedDay.targetMinutes} menit ({selectedDay.targetMet ? 'Target Terpenuhi 🎉' : 'Belum Memenuhi Target'})
                  </p>
                </div>
              </div>

              {selectedDay.isToday && (
                <button
                  onClick={() => recordReadingMinutes(5)}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs cursor-pointer shrink-0"
                >
                  +5 mnt
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Milestones Shelf */}
      {activeTab === 'milestones' && (
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {streakMilestonesData.milestones.map((m) => (
            <div
              key={m.id}
              className={`p-4 rounded-xl border flex items-start gap-3 transition-all ${
                m.unlocked
                  ? 'bg-stone-900/80 border-amber-600/40 shadow-sm'
                  : 'bg-stone-900/30 border-stone-800/80 opacity-70'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                m.unlocked
                  ? 'bg-amber-500/20 border border-amber-500/50 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-800 border border-stone-700 text-zinc-600'
              }`}>
                {m.unlocked ? <Trophy size={18} /> : <Lock size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h4 className={`text-xs font-bold truncate ${
                    m.unlocked ? 'text-zinc-100' : 'text-zinc-400'
                  }`}>
                    {m.title}
                  </h4>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    m.unlocked
                      ? 'bg-amber-950/60 text-amber-300 font-bold border border-amber-800/40'
                      : 'bg-stone-800 text-zinc-500'
                  }`}>
                    {m.days} Hari
                  </span>
                </div>

                <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                  {m.subtitle}
                </p>

                <div className="mt-2 text-[10px] font-medium flex items-center gap-1">
                  {m.unlocked ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Lencana Terbuka
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      Butuh {Math.max(1, m.days - goalProgress.currentStreak)} hari konsisten lagi
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Bottom Quote */}
      <div className="mt-5 pt-4 border-t border-stone-800/80 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-orange-400 shrink-0" />
          <p className="italic">
            "Membaca 15 menit setiap hari membentuk kebiasaan membaca 25+ buku bermutu dalam setahun."
          </p>
        </div>
      </div>
    </div>
  );
};
