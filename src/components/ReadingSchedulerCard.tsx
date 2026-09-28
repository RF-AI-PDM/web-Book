import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Clock, 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Send, 
  Volume2, 
  Flame, 
  AlertCircle, 
  Sliders, 
  Check, 
  RefreshCw 
} from 'lucide-react';
import { ReadingReminderSchedule } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  getReadingSchedule, 
  saveReadingSchedule, 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendNativePushNotification, 
  playChimeSound 
} from '../utils/notificationUtils';

interface ReadingSchedulerCardProps {
  className?: string;
  onExplore?: () => void;
}

const DAYS_OF_WEEK = [
  { day: 0, label: 'Min', full: 'Minggu' },
  { day: 1, label: 'Sen', full: 'Senin' },
  { day: 2, label: 'Sel', full: 'Selasa' },
  { day: 3, label: 'Rab', full: 'Rabu' },
  { day: 4, label: 'Kam', full: 'Kamis' },
  { day: 5, label: 'Jum', full: 'Jumat' },
  { day: 6, label: 'Sab', full: 'Sabtu' },
];

export const ReadingSchedulerCard: React.FC<ReadingSchedulerCardProps> = ({
  className = ''
}) => {
  const { goalProgress } = useAuth();

  const [schedule, setSchedule] = useState<ReadingReminderSchedule>(() => getReadingSchedule());
  const [permission, setPermission] = useState<NotificationPermission>(() => getNotificationPermission());
  const [testNotificationSent, setTestNotificationSent] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Re-check permission on mount
  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleUpdateSchedule = (updates: Partial<ReadingReminderSchedule>) => {
    const updated = { ...schedule, ...updates };
    setSchedule(updated);
    saveReadingSchedule(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
    if (result === 'granted') {
      sendNativePushNotification('F15 Library: Notifikasi Diaktifkan! 🔔', {
        body: 'Pengingat membaca harian kamu telah aktif. Kami akan mengingatkanmu tepat waktu untuk menjaga streak membaca!'
      });
    }
  };

  const handleSendTestNotification = () => {
    setTestNotificationSent(true);

    if (schedule.soundEnabled) {
      playChimeSound('bell');
    }

    const title = `📖 Waktunya Membaca 15 Menit · Streak ${goalProgress.currentStreak} Hari!`;
    const body = schedule.customMessage || `Pertahankan streak ${goalProgress.currentStreak} hari-mu! Selesaikan 15 menit membaca hari ini. 🔥`;

    const sent = sendNativePushNotification(title, {
      body,
      tag: 'f15-reading-test'
    });

    setTimeout(() => setTestNotificationSent(false), 3500);

    if (!sent && permission !== 'granted') {
      // Prompt user to enable permissions
      handleRequestPermission();
    }
  };

  const toggleDay = (dayIndex: number) => {
    const exists = schedule.daysOfWeek.includes(dayIndex);
    let newDays: number[];
    if (exists) {
      if (schedule.daysOfWeek.length === 1) return; // keep at least 1 day
      newDays = schedule.daysOfWeek.filter(d => d !== dayIndex);
    } else {
      newDays = [...schedule.daysOfWeek, dayIndex].sort();
    }
    handleUpdateSchedule({ daysOfWeek: newDays });
  };

  const setPresetTime = (timeStr: string) => {
    handleUpdateSchedule({ time: timeStr });
  };

  return (
    <div className={`p-5 sm:p-6 rounded-2xl bg-[#14151c] border border-stone-800 shadow-md ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-sm shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <span>Jadwal & Pengingat Streak</span>
              {schedule.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Kirim notifikasi harian otomatis agar streak <strong className="text-orange-400">{goalProgress.currentStreak} hari</strong> kamu tetap terjaga.
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleUpdateSchedule({ enabled: !schedule.enabled })}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm ${
              schedule.enabled
                ? 'bg-orange-600 hover:bg-orange-500 text-white'
                : 'bg-stone-800 hover:bg-stone-700 text-zinc-400'
            }`}
          >
            {schedule.enabled ? <Bell size={14} /> : <BellOff size={14} />}
            <span>{schedule.enabled ? 'Pengingat Aktif' : 'Pengingat Dinonaktifkan'}</span>
          </button>
        </div>
      </div>

      {/* Browser Permission Banner */}
      <div className="pt-4">
        {permission === 'granted' ? (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              <span>Izin Notifikasi Web Browser telah <strong>Diberikan</strong>. Notifikasi akan berdering di waktu yang ditentukan.</span>
            </div>
            <button
              onClick={handleSendTestNotification}
              className="px-2.5 py-1 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
            >
              <Send size={11} />
              <span>Uji Coba</span>
            </button>
          </div>
        ) : permission === 'denied' ? (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>Notifikasi browser saat ini diblokir di pengaturan peramban Anda. Anda tetap akan menerima pengingat in-app & audio bell.</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-zinc-200 text-[11px] font-semibold cursor-pointer shrink-0"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 text-zinc-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400 shrink-0" />
              <span>Izinkan notifikasi browser agar pengingat dapat muncul di sistem komputer atau ponselmu.</span>
            </div>
            <button
              onClick={handleRequestPermission}
              className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer shrink-0 transition-colors"
            >
              Aktifkan Izin Browser
            </button>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <div className="pt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Column: Time & Day Selection */}
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Clock size={13} className="text-orange-400" />
                <span>Waktu Pengingat Harian</span>
              </label>
              <span className="font-mono text-sm font-bold text-orange-400 bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                {schedule.time} WIB
              </span>
            </div>

            <input
              type="time"
              value={schedule.time}
              onChange={(e) => handleUpdateSchedule({ time: e.target.value })}
              disabled={!schedule.enabled}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-orange-500 disabled:opacity-50"
            />

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              <span className="text-[10px] text-zinc-500">Pilihan Cepat:</span>
              {[
                { label: '07:00 Pagi', val: '07:00' },
                { label: '12:30 Siang', val: '12:30' },
                { label: '20:00 Malam', val: '20:00' },
                { label: '21:30 Santai', val: '21:30' },
                { label: '22:15 Night Owl', val: '22:15' }
              ].map(preset => (
                <button
                  key={preset.val}
                  onClick={() => setPresetTime(preset.val)}
                  disabled={!schedule.enabled}
                  className={`text-[10px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    schedule.time === preset.val
                      ? 'bg-orange-600/20 border-orange-500/40 text-orange-300 font-bold'
                      : 'bg-stone-800/80 border-stone-700/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Days of Week */}
          <div className="pt-2 border-t border-stone-800/60">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5 mb-2">
              <Calendar size={13} className="text-orange-400" />
              <span>Frekuensi Hari</span>
            </label>

            <div className="grid grid-cols-7 gap-1.5">
              {DAYS_OF_WEEK.map((item) => {
                const isSelected = schedule.daysOfWeek.includes(item.day);
                return (
                  <button
                    key={item.day}
                    onClick={() => toggleDay(item.day)}
                    disabled={!schedule.enabled}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                      isSelected
                        ? 'bg-orange-600/30 border-orange-500 text-orange-200 shadow-sm'
                        : 'bg-stone-950/60 border-stone-800 text-zinc-500 hover:text-zinc-300'
                    } disabled:opacity-50`}
                    title={item.full}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2">
              <button
                onClick={() => handleUpdateSchedule({ daysOfWeek: [0, 1, 2, 3, 4, 5, 6] })}
                disabled={!schedule.enabled}
                className="hover:text-orange-400 underline cursor-pointer"
              >
                Setiap Hari (7 Hari)
              </button>
              <button
                onClick={() => handleUpdateSchedule({ daysOfWeek: [1, 2, 3, 4, 5] })}
                disabled={!schedule.enabled}
                className="hover:text-orange-400 underline cursor-pointer"
              >
                Hari Kerja (Sen-Jum)
              </button>
              <button
                onClick={() => handleUpdateSchedule({ daysOfWeek: [0, 6] })}
                disabled={!schedule.enabled}
                className="hover:text-orange-400 underline cursor-pointer"
              >
                Akhir Pekan (Sab-Min)
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Custom Message, Sound Chime, & Preview */}
        <div className="p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Sliders size={13} className="text-orange-400" />
                  <span>Pesan Motivasi Pengingat</span>
                </span>
                <span className="text-[10px] text-zinc-500">Bisa diubah</span>
              </label>

              <textarea
                value={schedule.customMessage}
                onChange={(e) => handleUpdateSchedule({ customMessage: e.target.value })}
                disabled={!schedule.enabled}
                rows={2}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-zinc-100 text-xs focus:outline-none focus:border-orange-500 leading-relaxed disabled:opacity-50"
                placeholder="Tuliskan pesan motivasi streak kamu di sini..."
              />
            </div>

            {/* Sound Chime Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-950/70 border border-stone-800">
              <div className="flex items-center gap-2">
                <Volume2 size={15} className={schedule.soundEnabled ? 'text-orange-400' : 'text-zinc-600'} />
                <div>
                  <h5 className="text-xs font-bold text-zinc-200">Suara Bel Harmonis</h5>
                  <p className="text-[10px] text-zinc-500">Mainkan nada lonceng saat waktu pengingat tiba</p>
                </div>
              </div>

              <button
                onClick={() => handleUpdateSchedule({ soundEnabled: !schedule.soundEnabled })}
                disabled={!schedule.enabled}
                className={`w-9 h-5 rounded-full transition-colors cursor-pointer relative p-0.5 ${
                  schedule.soundEnabled ? 'bg-orange-600' : 'bg-stone-800'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  schedule.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Preview Banner of How the Push Notification Appears */}
            <div className="pt-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block mb-1">
                Tinjauan Tampilan Notifikasi
              </span>
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 text-left space-y-1 relative overflow-hidden">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-600 flex items-center justify-center text-[10px] font-bold text-white">
                    F15
                  </div>
                  <span className="text-xs font-bold text-zinc-100">
                    📖 F15 Library · Streak {goalProgress.currentStreak} Hari
                  </span>
                  <span className="text-[10px] text-zinc-500 ml-auto">{schedule.time}</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed pl-6">
                  {schedule.customMessage || 'Waktunya 15 menit membaca untuk menjaga streak konsistenmu! 🔥'}
                </p>
              </div>
            </div>
          </div>

          {/* Test & Save Status */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
            <button
              onClick={handleSendTestNotification}
              className="px-3.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
            >
              <Send size={13} className="text-orange-400" />
              <span>Kirim Pengingat Uji Coba</span>
            </button>

            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check size={13} /> Tersimpan Otomatis
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Test Notification Feedback */}
      {testNotificationSent && (
        <div className="mt-4 p-3 rounded-xl bg-orange-950/70 border border-orange-500/50 text-orange-200 text-xs flex items-center gap-2 animate-in fade-in">
          <Sparkles size={16} className="text-orange-400 shrink-0" />
          <span>Pengingat uji coba telah dikirimkan! Pastikan suara perangkatmu aktif untuk mendengarkan nada lonceng pengingat.</span>
        </div>
      )}
    </div>
  );
};
