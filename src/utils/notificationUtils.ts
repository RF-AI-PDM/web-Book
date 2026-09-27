import { ReadingReminderSchedule } from '../types';

export const LOCAL_STORAGE_SCHEDULE = 'f15_reading_schedule';

export const DEFAULT_SCHEDULE: ReadingReminderSchedule = {
  enabled: true,
  time: '20:00', // 8:00 PM default
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Every day
  customMessage: 'Waktunya 15 menit membaca buku hari ini untuk menjaga streak membaca konsistenmu! 📖🔥',
  soundEnabled: true
};

export const getReadingSchedule = (): ReadingReminderSchedule => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SCHEDULE);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_SCHEDULE, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SCHEDULE;
};

export const saveReadingSchedule = (schedule: ReadingReminderSchedule): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_SCHEDULE, JSON.stringify(schedule));
  } catch {
    // ignore
  }
};

/**
 * Plays a calm, gentle synthesized bell/chime using Web Audio API
 */
export const playChimeSound = (type: 'complete' | 'break' | 'bell' = 'complete'): void => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'complete') {
      // Harmonic chord: F5 (698.46Hz), A5 (880Hz), C6 (1046.5Hz)
      const freqs = [698.46, 880, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 1.3);
      });
    } else if (type === 'break') {
      // Gentle break tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.3); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } else {
      // Single clean bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    }
  } catch (err) {
    console.warn('Audio playback failed or restricted:', err);
  }
};

/**
 * Checks if the Web Notification API is supported
 */
export const isNotificationSupported = (): boolean => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * Retrieves current browser notification permission
 */
export const getNotificationPermission = (): NotificationPermission => {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
};

/**
 * Requests browser notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isNotificationSupported()) return 'denied';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
};

/**
 * Triggers a native system push notification if permitted
 */
export const sendNativePushNotification = (
  title: string,
  options?: NotificationOptions
): boolean => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return true;
  } catch (err) {
    console.warn('Failed to send native push notification:', err);
    return false;
  }
};

/**
 * Evaluates whether a reminder should trigger right now
 */
export const shouldTriggerReminderNow = (schedule: ReadingReminderSchedule): boolean => {
  if (!schedule.enabled) return false;

  const now = new Date();
  const currentDay = now.getDay();
  if (!schedule.daysOfWeek.includes(currentDay)) return false;

  const [hoursStr, minutesStr] = schedule.time.split(':');
  const targetHour = parseInt(hoursStr, 10);
  const targetMinute = parseInt(minutesStr, 10);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Match current hour and minute
  const isTimeMatch = currentHour === targetHour && currentMinute === targetMinute;
  if (!isTimeMatch) return false;

  const todayIsoDate = now.toISOString().slice(0, 10);
  if (schedule.lastNotifiedDate === todayIsoDate) {
    return false; // Already notified today
  }

  return true;
};
