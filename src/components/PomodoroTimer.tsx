import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Volume2, 
  VolumeX,
  ChevronDown,
  ChevronUp, 
  Sparkles,
  Flame,
  X
} from 'lucide-react';
import { playChimeSound } from '../utils/notificationUtils';
import { useAuth } from '../context/AuthContext';

interface PomodoroTimerProps {
  className?: string;
  onSessionComplete?: (minutes: number) => void;
  bookTitle?: string;
}

type TimerMode = 'focus' | 'break';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  className = '',
  onSessionComplete,
  bookTitle
}) => {
  const { recordReadingMinutes } = useAuth();

  // Mode durations in seconds
  const [focusDurationMinutes, setFocusDurationMinutes] = useState<number>(15);
  const [breakDurationMinutes] = useState<number>(5);

  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [sessionCount, setSessionCount] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Total seconds for current mode
  const totalSeconds = mode === 'focus' ? focusDurationMinutes * 60 : breakDurationMinutes * 60;
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100));

  // Clean interval on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, mode, focusDurationMinutes, breakDurationMinutes, soundEnabled]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    if (mode === 'focus') {
      if (soundEnabled) {
        playChimeSound('complete');
      }
      setSessionCount(prev => prev + 1);
      setShowCelebration(true);

      // Auto-log reading minutes
      recordReadingMinutes(focusDurationMinutes);
      if (onSessionComplete) {
        onSessionComplete(focusDurationMinutes);
      }

      // Switch to break mode
      setMode('break');
      setTimeLeft(breakDurationMinutes * 60);
    } else {
      if (soundEnabled) {
        playChimeSound('break');
      }
      setMode('focus');
      setTimeLeft(focusDurationMinutes * 60);
    }
  };

  const togglePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'focus' ? focusDurationMinutes * 60 : breakDurationMinutes * 60);
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(newMode === 'focus' ? focusDurationMinutes * 60 : breakDurationMinutes * 60);
  };

  const setDuration = (minutes: number) => {
    setFocusDurationMinutes(minutes);
    if (mode === 'focus') {
      setIsRunning(false);
      setTimeLeft(minutes * 60);
    }
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`relative select-none ${className}`}>
      {/* Celebration Popup */}
      {showCelebration && (
        <div className="absolute bottom-full mb-3 right-0 w-80 p-4 rounded-2xl bg-[#191a24] border border-orange-500/50 shadow-2xl text-zinc-100 z-50 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-zinc-100">Sesi 15 Menit Tuntas!</h4>
                <p className="text-[11px] text-orange-300">Target harianmu telah bertambah</p>
              </div>
            </div>
            <button
              onClick={() => setShowCelebration(false)}
              className="text-zinc-400 hover:text-white p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>

          <p className="text-xs text-zinc-300 mb-3 leading-relaxed">
            Hebat! Kamu telah fokus membaca <strong>{bookTitle || 'buku ini'}</strong> selama {focusDurationMinutes} menit tanpa distraksi.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => {
                setShowCelebration(false);
                switchMode('break');
                setIsRunning(true);
              }}
              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Coffee size={13} />
              <span>Istirahat 5 Mnt</span>
            </button>
            <button
              onClick={() => {
                setShowCelebration(false);
                switchMode('focus');
                setIsRunning(true);
              }}
              className="flex-1 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
            >
              Lanjut Baca
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Pill / Widget */}
      <div className={`transition-all duration-300 rounded-2xl border backdrop-blur-md shadow-lg ${
        mode === 'focus'
          ? isRunning
            ? 'bg-stone-900/95 border-orange-500/40 shadow-orange-950/20'
            : 'bg-stone-900/90 border-stone-700/80'
          : 'bg-emerald-950/90 border-emerald-600/40 shadow-emerald-950/20'
      }`}>
        {/* Compact Mode (when collapsed) */}
        {isCollapsed ? (
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div 
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-2 cursor-pointer"
              title="Perbesar Pengatur Waktu Pomodoro"
            >
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-orange-500 animate-pulse' : 'bg-zinc-500'}`} />
              <span className="font-mono text-xs font-bold text-zinc-200">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {mode === 'focus' ? 'Fokus 15m' : 'Istirahat'}
              </span>
            </div>

            <button
              onClick={togglePlayPause}
              className={`p-1 rounded-lg text-xs cursor-pointer ${
                isRunning ? 'text-amber-400 hover:bg-stone-800' : 'text-orange-400 hover:bg-stone-800'
              }`}
              title={isRunning ? 'Jeda' : 'Mulai'}
            >
              {isRunning ? <Pause size={13} /> : <Play size={13} />}
            </button>

            <button
              onClick={() => setIsCollapsed(false)}
              className="text-zinc-500 hover:text-zinc-300 p-0.5 cursor-pointer"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        ) : (
          /* Expanded Mode */
          <div className="p-3 w-64 sm:w-72">
            {/* Top Row: Mode Switcher & Collapse */}
            <div className="flex items-center justify-between gap-1 mb-2.5">
              <div className="flex items-center gap-1 bg-stone-950/60 p-0.5 rounded-lg border border-stone-800 text-[10px]">
                <button
                  onClick={() => switchMode('focus')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    mode === 'focus'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Flame size={11} className={mode === 'focus' ? 'fill-white' : ''} />
                  <span>Fokus ({focusDurationMinutes}m)</span>
                </button>
                <button
                  onClick={() => switchMode('break')}
                  className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    mode === 'break'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <Coffee size={11} />
                  <span>Istirahat (5m)</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-zinc-400">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1 rounded hover:bg-stone-800 hover:text-zinc-200 cursor-pointer"
                  title={soundEnabled ? 'Matikan Suara Bel' : 'Nyalakan Suara Bel'}
                >
                  {soundEnabled ? <Volume2 size={13} className="text-orange-400" /> : <VolumeX size={13} />}
                </button>

                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 rounded hover:bg-stone-800 hover:text-zinc-200 cursor-pointer"
                  title="Kecilkan ke Pill"
                >
                  <ChevronUp size={13} />
                </button>
              </div>
            </div>

            {/* Countdown Display & Progress Bar */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-mono text-2xl font-bold tracking-tight text-zinc-100 flex items-baseline gap-1.5">
                  <span>{formatTime(timeLeft)}</span>
                  {isRunning && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                  <span>{mode === 'focus' ? 'Sesi Membaca F15' : 'Relaksasi Mata & Catat Ide'}</span>
                  {sessionCount > 0 && (
                    <span className="text-orange-400 font-bold">({sessionCount}x tuntas)</span>
                  )}
                </div>
              </div>

              {/* Play / Pause / Reset Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={togglePlayPause}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold transition-all cursor-pointer shadow-md ${
                    isRunning
                      ? 'bg-amber-600/90 hover:bg-amber-500 text-white'
                      : 'bg-orange-600 hover:bg-orange-500 text-white'
                  }`}
                  title={isRunning ? 'Jeda Fokus' : 'Mulai Fokus 15 Menit'}
                >
                  {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
                </button>

                <button
                  onClick={resetTimer}
                  className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-400 hover:text-zinc-200 flex items-center justify-center cursor-pointer transition-colors"
                  title="Atur Ulang Waktu"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Progress line */}
            <div className="w-full bg-stone-800/80 h-1.5 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-300 ${
                  mode === 'focus'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Preset quick durations (10m, 15m, 25m) */}
            {mode === 'focus' && (
              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-stone-800/70">
                <span>Durasi:</span>
                <div className="flex items-center gap-1">
                  {[10, 15, 25].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDuration(mins)}
                      className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                        focusDurationMinutes === mins
                          ? 'bg-stone-800 text-orange-400 font-bold border border-orange-500/30'
                          : 'hover:text-zinc-300'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
