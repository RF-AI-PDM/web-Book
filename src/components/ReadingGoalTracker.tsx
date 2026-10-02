import React, { useState } from 'react';
import { 
  Target, 
  Flame, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Edit3, 
  Plus, 
  Award, 
  TrendingUp, 
  Sparkles,
  ChevronRight,
  Info,
  X,
  Check,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLocalDateString } from '../utils/readingGoalUtils';

interface ReadingGoalTrackerProps {
  className?: string;
  onOpenReader?: () => void;
}

export const ReadingGoalTracker: React.FC<ReadingGoalTrackerProps> = ({
  className = '',
  onOpenReader
}) => {
  const { 
    readingGoal, 
    goalProgress, 
    setReadingGoalConfig, 
    recordReadingMinutes, 
    setDayReadingMinutes,
    resetReadingGoalProgress 
  } = useAuth();

  const [activeMode, setActiveMode] = useState<'daily' | 'weekly'>(readingGoal.mode || 'daily');
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);
  const [tempTargetMinutes, setTempTargetMinutes] = useState<number>(readingGoal.targetMinutesPerDay || 15);
  const [tempGoalMode, setTempGoalMode] = useState<'daily' | 'weekly'>(readingGoal.mode || 'daily');

  const [isLoggingManual, setIsLoggingManual] = useState<boolean>(false);
  const [manualMinutes, setManualMinutes] = useState<number>(15);
  const [manualDate, setManualDate] = useState<string>(getLocalDateString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveGoal = async () => {
    const validTarget = Math.max(5, Math.min(180, Number(tempTargetMinutes) || 15));
    await setReadingGoalConfig({
      targetMinutesPerDay: validTarget,
      mode: tempGoalMode
    });
    setActiveMode(tempGoalMode);
    setIsEditingGoal(false);
    showToast(`Target berhasil diperbarui: ${validTarget} menit / hari`);
  };

  const handleManualLog = async () => {
    const mins = Math.max(1, Math.min(300, Number(manualMinutes) || 15));
    await recordReadingMinutes(mins, manualDate);
    setIsLoggingManual(false);
    showToast(`Berhasil mencatat +${mins} menit membaca untuk ${manualDate === getLocalDateString() ? 'hari ini' : manualDate}!`);
  };

  const PRESET_TARGETS = [10, 15, 20, 30, 45, 60];

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-[#14151c] border border-stone-800 shadow-md ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-200 text-xs flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-orange-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-orange-300 hover:text-white">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Header: Title, Mode Switcher, Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <Target size={17} />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>Target Membaca</span>
                {goalProgress.currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-sans font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-full">
                    <Flame size={12} className="text-amber-500 fill-amber-500" />
                    <span>{goalProgress.currentStreak} Hari Beruntun</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-zinc-400">
                Target harian: <strong className="text-orange-400 font-semibold">{readingGoal.targetMinutesPerDay} menit/hari</strong> ({readingGoal.targetMinutesPerDay * 7} mnt/minggu)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Daily vs Weekly Toggle */}
          <div className="p-1 rounded-xl bg-stone-900 border border-stone-800 flex items-center text-xs">
            <button
              onClick={() => setActiveMode('daily')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMode === 'daily'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Harian
            </button>
            <button
              onClick={() => setActiveMode('weekly')}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                activeMode === 'weekly'
                  ? 'bg-stone-800 text-orange-400 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mingguan
            </button>
          </div>

          {/* Quick Action: Log Minutes */}
          <button
            onClick={() => setIsLoggingManual(true)}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Catat menit membaca manual"
          >
            <Plus size={14} className="text-orange-400" />
            <span className="hidden sm:inline">Catat Baca</span>
          </button>

          {/* Quick Action: Edit Goal */}
          <button
            onClick={() => {
              setTempTargetMinutes(readingGoal.targetMinutesPerDay);
              setTempGoalMode(readingGoal.mode);
              setIsEditingGoal(true);
            }}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ubah target menit membaca"
          >
            <Edit3 size={13} className="text-orange-400" />
            <span className="hidden sm:inline">Atur Target</span>
          </button>
        </div>
      </div>

      {/* Main Progress Display */}
      {activeMode === 'daily' ? (
        /* DAILY PROGRESS VIEW */
        <div className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Kemajuan Hari Ini
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-serif font-bold text-zinc-100">
                  {goalProgress.todayMinutes}
                </span>
                <span className="text-zinc-400 text-sm font-medium">
                  / {goalProgress.todayTarget} Menit
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                  goalProgress.isTodayAchieved 
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-300' 
                    : 'bg-orange-950/60 border border-orange-800/50 text-orange-300'
                }`}>
                  {goalProgress.todayPercent}%
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              {goalProgress.isTodayAchieved ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Target Hari Ini Tercapai! 🎉</span>
                </div>
              ) : (
                <div className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Clock size={14} className="text-orange-400" />
                  <span>
                    <strong className="text-zinc-200">{goalProgress.todayRemainingMinutes} menit</strong> lagi untuk tuntas hari ini
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Primary Daily Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-stone-900 border border-stone-800 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  goalProgress.isTodayAchieved
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.25)]'
                }`}
                style={{ width: `${Math.min(100, Math.max(3, goalProgress.todayPercent))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span>0 mnt</span>
              <span>Target: {goalProgress.todayTarget} mnt</span>
              <span>{goalProgress.isTodayAchieved ? `${goalProgress.todayMinutes} mnt (Tercapai)` : '100%'}</span>
            </div>
          </div>

          {/* Context Card: Tips / Motivation */}
          <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-800/80 flex items-start gap-3">
            <div className="p-1.5 rounded-lg bg-orange-600/10 text-orange-400 shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <div className="text-xs text-zinc-400 leading-relaxed">
              {goalProgress.isTodayAchieved ? (
                <p>
                  Konsistensi luar biasa! Membaca {goalProgress.todayMinutes} menit hari ini membantu memperkuat fokus dan retensi wawasan baru.
                </p>
              ) : (
                <p>
                  Baca koleksi selama <strong>15 menit</strong> untuk mencapai target harianmu. Kamu bisa melanjutkan buku kapan saja.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* WEEKLY PROGRESS VIEW */
        <div className="pt-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                Kemajuan Minggu Ini
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-serif font-bold text-zinc-100">
                  {goalProgress.weeklyMinutes}
                </span>
                <span className="text-zinc-400 text-sm font-medium">
                  / {goalProgress.weeklyTarget} Menit
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-orange-950/60 border border-orange-800/50 text-orange-300">
                  {goalProgress.weeklyPercent}%
                </span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-zinc-300 font-medium">
                <strong className="text-orange-400">{goalProgress.weeklyDaysAchieved} dari 7 hari</strong> memenuhi target harian
              </p>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                Sisa waktu minggu ini: {goalProgress.weeklyRemainingMinutes} menit
              </p>
            </div>
          </div>

          {/* Primary Weekly Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full bg-stone-900 border border-stone-800 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.25)] transition-all duration-700"
                style={{ width: `${Math.min(100, Math.max(3, goalProgress.weeklyPercent))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 font-medium">
              <span>0 mnt</span>
              <span>Target: {goalProgress.weeklyTarget} mnt</span>
              <span>100%</span>
            </div>
          </div>

          {/* 7-DAY VISUAL TRACKER GRID */}
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-zinc-400 mb-2.5 flex items-center justify-between">
              <span>Rincian 7 Hari Minggu Ini (Senin – Minggu)</span>
              <span className="text-[10px] text-zinc-500">Target per hari: {goalProgress.todayTarget} mnt</span>
            </h4>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {goalProgress.weekDays.map((day) => {
                const dayFillPercent = Math.min(100, Math.round((day.minutes / goalProgress.todayTarget) * 100));
                
                return (
                  <div
                    key={day.date}
                    className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                      day.isToday
                        ? 'bg-stone-800/80 border-orange-500/60 shadow-sm'
                        : 'bg-stone-900/50 border-stone-800/80 hover:bg-stone-800/40'
                    }`}
                  >
                    {/* Day name & date */}
                    <div>
                      <span className={`text-[10px] sm:text-xs font-semibold block ${
                        day.isToday ? 'text-orange-400' : 'text-zinc-400'
                      }`}>
                        {day.dayShort}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        {day.dayOfMonth}
                      </span>
                    </div>

                    {/* Vertical Mini-Bar */}
                    <div className="my-2 w-2.5 sm:w-3 h-14 bg-stone-800 rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                      <div
                        className={`w-full rounded-full transition-all duration-500 ${
                          day.targetMet
                            ? 'bg-emerald-500'
                            : day.minutes > 0
                            ? 'bg-orange-500'
                            : 'bg-transparent'
                        }`}
                        style={{ height: `${Math.max(day.minutes > 0 ? 12 : 0, dayFillPercent)}%` }}
                      />
                    </div>

                    {/* Minutes and checkmark indicator */}
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[10px] font-medium text-zinc-300">
                        {day.minutes}m
                      </span>
                      {day.targetMet ? (
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full border border-stone-700" />
                      )}
                    </div>

                    {day.isToday && (
                      <span className="mt-1 text-[8px] uppercase tracking-wider text-orange-400 font-bold">
                        Hari Ini
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Overview Stats Badges */}
      <div className="mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs">
        <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60">
          <span className="text-zinc-500 text-[11px] block">Target Harian</span>
          <span className="text-zinc-200 font-bold text-sm mt-0.5 block">
            {readingGoal.targetMinutesPerDay} Menit
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60">
          <span className="text-zinc-500 text-[11px] block">Rekor Beruntun</span>
          <span className="text-amber-400 font-bold text-sm mt-0.5 flex items-center gap-1">
            <Flame size={13} className="fill-amber-400" />
            <span>{goalProgress.currentStreak} Hari</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60">
          <span className="text-zinc-500 text-[11px] block">Total Waktu Baca</span>
          <span className="text-zinc-200 font-bold text-sm mt-0.5 block">
            {goalProgress.totalAllTimeMinutes} Menit
          </span>
        </div>

        <div className="p-3 rounded-xl bg-stone-900/40 border border-stone-800/60">
          <span className="text-zinc-500 text-[11px] block">Tercapai Minggu Ini</span>
          <span className="text-emerald-400 font-bold text-sm mt-0.5 block">
            {goalProgress.weeklyDaysAchieved} / 7 Hari
          </span>
        </div>
      </div>

      {/* EDIT GOAL MODAL */}
      {isEditingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16171f] border border-stone-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-orange-500" />
                <h3 className="font-serif font-bold text-base text-zinc-100">
                  Atur Target Membaca
                </h3>
              </div>
              <button
                onClick={() => setIsEditingGoal(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 block">
                Pilih Target Menit per Hari:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TARGETS.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTempTargetMinutes(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      tempTargetMinutes === m
                        ? 'bg-orange-600 border-orange-500 text-white shadow-sm'
                        : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                    }`}
                  >
                    {m} Menit
                    {m === 15 && <span className="block text-[9px] font-normal opacity-90">Standar F15</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 block">
                Atau masukkan angka kustom:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={tempTargetMinutes}
                  onChange={(e) => setTempTargetMinutes(Number(e.target.value))}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
                />
                <span className="text-xs text-zinc-400 shrink-0">menit/hari</span>
              </div>
              <span className="text-[11px] text-zinc-500">
                Setara dengan {tempTargetMinutes * 7} menit per minggu.
              </span>
            </div>

            {/* Focus Mode Preference */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Tampilan Utama di Profil:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTempGoalMode('daily')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left cursor-pointer ${
                    tempGoalMode === 'daily'
                      ? 'bg-orange-950/40 border-orange-500/80 text-orange-200'
                      : 'bg-stone-900 border-stone-800 text-zinc-400'
                  }`}
                >
                  <span className="font-semibold block">Fokus Harian</span>
                  <span className="text-[10px] text-zinc-500">Pantau menit hari ini</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTempGoalMode('weekly')}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-left cursor-pointer ${
                    tempGoalMode === 'weekly'
                      ? 'bg-orange-950/40 border-orange-500/80 text-orange-200'
                      : 'bg-stone-900 border-stone-800 text-zinc-400'
                  }`}
                >
                  <span className="font-semibold block">Fokus Mingguan</span>
                  <span className="text-[10px] text-zinc-500">Pantau 7 hari beruntun</span>
                </button>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsEditingGoal(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGoal}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                Simpan Target
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL LOG MODAL */}
      {isLoggingManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-[#16171f] border border-stone-700 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                <h3 className="font-serif font-bold text-base text-zinc-100">
                  Catat Waktu Baca Manual
                </h3>
              </div>
              <button
                onClick={() => setIsLoggingManual(false)}
                className="text-zinc-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Membaca ringkasan di luar aplikasi atau membaca buku fisik? Tambahkan menit membaca Anda agar kemajuan target dan streak tetap tercatat!
            </p>

            {/* Quick preset buttons */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 block">
                Tambah Cepat:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 15, 30].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setManualMinutes(m)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      manualMinutes === m
                        ? 'bg-orange-600 border-orange-500 text-white'
                        : 'bg-stone-900 border-stone-800 text-zinc-300 hover:bg-stone-800'
                    }`}
                  >
                    +{m} mnt
                  </button>
                ))}
              </div>
            </div>

            {/* Minutes input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 block">
                Durasi Membaca (menit):
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={manualMinutes}
                onChange={(e) => setManualMinutes(Number(e.target.value))}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Date selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400 block">
                Tanggal:
              </label>
              <input
                type="date"
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setIsLoggingManual(false)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-xs font-semibold text-zinc-300 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleManualLog}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-xs font-semibold text-white shadow-sm transition-colors cursor-pointer"
              >
                Tambahkan ke Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
