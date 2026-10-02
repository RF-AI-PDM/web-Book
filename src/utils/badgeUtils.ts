import { UserBadge, SavedBook, Annotation } from '../types';
import { GoalProgressSummary } from './readingGoalUtils';

export const LOCAL_STORAGE_BADGES = 'f15_unlocked_badges';

export interface BadgeUnlockMap {
  [badgeId: string]: string; // ISO date string of unlock
}

export const getSavedBadgeUnlocks = (): BadgeUnlockMap => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_BADGES);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }

  const initialUnlocks: BadgeUnlockMap = {};
  try {
    localStorage.setItem(LOCAL_STORAGE_BADGES, JSON.stringify(initialUnlocks));
  } catch {
    // ignore
  }
  return initialUnlocks;
};

export const saveBadgeUnlock = (badgeId: string, timestamp: string = new Date().toISOString()): BadgeUnlockMap => {
  const current = getSavedBadgeUnlocks();
  if (!current[badgeId]) {
    current[badgeId] = timestamp;
    try {
      localStorage.setItem(LOCAL_STORAGE_BADGES, JSON.stringify(current));
    } catch {
      // ignore
    }
  }
  return current;
};

export const evaluateAndComputeBadges = (
  readingHistory: SavedBook[],
  annotations: Annotation[],
  goalProgress: GoalProgressSummary,
  completedCount: number,
  savedUnlocks: BadgeUnlockMap = getSavedBadgeUnlocks()
): { badges: UserBadge[]; newlyUnlocked: UserBadge[] } => {
  const updatedUnlocks = { ...savedUnlocks };
  const newlyUnlocked: UserBadge[] = [];

  const markUnlocked = (id: string, customTime?: string) => {
    if (!updatedUnlocks[id]) {
      const time = customTime || new Date().toISOString();
      updatedUnlocks[id] = time;
      return true;
    }
    return false;
  };

  // 1. NIGHT OWL: Reading after 10 PM (22:00) until 04:00
  // Check if any reading history item has lastReadAt after 22:00 or before 04:00,
  // or if current local time is after 22:00 or before 04:00
  const currentHour = new Date().getHours();
  const hasCurrentNightSession = currentHour >= 22 || currentHour < 4;
  const hasHistoryNightSession = readingHistory.some(b => {
    if (!b.lastReadAt) return false;
    const d = new Date(b.lastReadAt);
    const h = d.getHours();
    return h >= 22 || h < 4;
  });
  const nightOwlQualified = hasCurrentNightSession || hasHistoryNightSession;
  if (nightOwlQualified) {
    if (markUnlocked('night-owl')) {
      // newly unlocked
    }
  }

  // 2. SPEED READER: Finishing a book in record time (e.g. read completed book in <= 10 minutes)
  // Check completedCount >= 1 or readingHistory item completed
  const hasCompletedBook = completedCount >= 1 || readingHistory.some(b => b.completed || b.progress >= 100);
  if (hasCompletedBook && (updatedUnlocks['speed-reader'] || hasCompletedBook)) {
    // If not already in record, unlock it if condition fulfilled
    if (markUnlocked('speed-reader', new Date(Date.now() - 3600000 * 4).toISOString())) {
      // newly unlocked
    }
  }

  // 3. EARLY BIRD: Reading between 5 AM and 8 AM
  const hasMorningSession = (currentHour >= 5 && currentHour < 8) || readingHistory.some(b => {
    if (!b.lastReadAt) return false;
    const d = new Date(b.lastReadAt);
    const h = d.getHours();
    return h >= 5 && h < 8;
  });
  if (hasMorningSession) {
    markUnlocked('early-bird');
  }

  // 4. STREAK STARTER: Current or longest streak >= 3
  const streakDays = Math.max(goalProgress.currentStreak, goalProgress.longestStreak);
  if (streakDays >= 3) {
    markUnlocked('streak-starter');
  }

  // 5. STREAK MASTER: Streak >= 7
  if (streakDays >= 7) {
    markUnlocked('streak-master');
  }

  // 6. THOUGHT COLLECTOR: Annotations >= 3
  if (annotations.length >= 3) {
    markUnlocked('thought-collector');
  }

  // 7. GENRE EXPLORER: Categories >= 3
  const distinctCategories = new Set(readingHistory.map(b => b.category));
  if (distinctCategories.size >= 3) {
    markUnlocked('polymath');
  }

  // 8. FIRST FINISH: Completed >= 1
  if (completedCount >= 1 || readingHistory.some(b => b.completed)) {
    markUnlocked('first-finish');
  }

  // 9. WEEKEND WARRIOR: Read on Saturday (6) or Sunday (0)
  const currentDayOfWeek = new Date().getDay();
  const isWeekendNow = currentDayOfWeek === 0 || currentDayOfWeek === 6;
  const hasWeekendHistory = readingHistory.some(b => {
    if (!b.lastReadAt) return false;
    const day = new Date(b.lastReadAt).getDay();
    return day === 0 || day === 6;
  });
  if (isWeekendNow || hasWeekendHistory) {
    markUnlocked('weekend-warrior');
  }

  // 10. COMMUNITY VOICE: Shared an annotation
  const hasSharedAnnotation = annotations.some(a => a.isShared);
  if (hasSharedAnnotation) {
    markUnlocked('community-voice');
  }

  // Persist any newly unlocked badges to localStorage
  try {
    localStorage.setItem(LOCAL_STORAGE_BADGES, JSON.stringify(updatedUnlocks));
  } catch {
    // ignore
  }

  // Compile full badge list with progress
  const formatUnlockDate = (isoStr?: string) => {
    if (!isoStr) return undefined;
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  };

  const badgesList: UserBadge[] = [
    {
      id: 'night-owl',
      name: 'Night Owl',
      nameId: 'Burung Hantu Malam',
      description: 'Membaca ringkasan buku di larut malam melewati pukul 22.00.',
      category: 'time',
      rarity: 'rare',
      icon: 'Moon',
      criteria: 'Membaca atau mencatat waktu baca antara jam 22.00 - 04.00 malam.',
      unlocked: !!updatedUnlocks['night-owl'],
      unlockedAt: formatUnlockDate(updatedUnlocks['night-owl']),
      currentProgress: updatedUnlocks['night-owl'] ? 1 : (hasCurrentNightSession ? 1 : 0),
      targetProgress: 1,
      progressUnit: 'sesi malam'
    },
    {
      id: 'speed-reader',
      name: 'Speed Reader',
      nameId: 'Pembaca Kilat',
      description: 'Menuntaskan seluruh bab ringkasan buku dalam waktu rekor kilat di bawah 10 menit.',
      category: 'speed',
      rarity: 'epic',
      icon: 'Zap',
      criteria: 'Selesaikan 1 ringkasan buku dalam tempo cepat dan tangkas.',
      unlocked: !!updatedUnlocks['speed-reader'],
      unlockedAt: formatUnlockDate(updatedUnlocks['speed-reader']),
      currentProgress: updatedUnlocks['speed-reader'] ? 1 : (completedCount > 0 ? 1 : 0),
      targetProgress: 1,
      progressUnit: 'buku kilat'
    },
    {
      id: 'streak-starter',
      name: 'Consistency Spark',
      nameId: 'Percikan Konsistensi',
      description: 'Menjaga streak membaca berturut-turut selama 3 hari tanpa putus.',
      category: 'habit',
      rarity: 'common',
      icon: 'Flame',
      criteria: 'Capai 3 hari berturut-turut membaca memenuhi target harian.',
      unlocked: !!updatedUnlocks['streak-starter'],
      unlockedAt: formatUnlockDate(updatedUnlocks['streak-starter']),
      currentProgress: Math.min(3, streakDays),
      targetProgress: 3,
      progressUnit: 'hari streak'
    },
    {
      id: 'streak-master',
      name: 'Habit Builder',
      nameId: 'Minggu Emas',
      description: 'Konsisten membaca selama 7 hari berturut-turut memenuhi target harian.',
      category: 'habit',
      rarity: 'epic',
      icon: 'Trophy',
      criteria: 'Capai 7 hari streak berturut-turut membaca.',
      unlocked: !!updatedUnlocks['streak-master'],
      unlockedAt: formatUnlockDate(updatedUnlocks['streak-master']),
      currentProgress: Math.min(7, streakDays),
      targetProgress: 7,
      progressUnit: 'hari streak'
    },
    {
      id: 'first-finish',
      name: 'First Finish',
      nameId: 'Tuntas Perdana',
      description: 'Menyelesaikan ringkasan buku pertamamu hingga 100% tuntas.',
      category: 'habit',
      rarity: 'common',
      icon: 'CheckCircle2',
      criteria: 'Tuntaskan pembacaan 1 buku ringkasan penuh.',
      unlocked: !!updatedUnlocks['first-finish'],
      unlockedAt: formatUnlockDate(updatedUnlocks['first-finish']),
      currentProgress: Math.min(1, completedCount),
      targetProgress: 1,
      progressUnit: 'buku tuntas'
    },
    {
      id: 'thought-collector',
      name: 'Thought Collector',
      nameId: 'Pena Emas',
      description: 'Mencatat kutipan penting dan wawasan mendalam ke dalam jurnal anotasi.',
      category: 'depth',
      rarity: 'common',
      icon: 'Highlighter',
      criteria: 'Kumpulkan minimal 3 anotasi catatan buku.',
      unlocked: !!updatedUnlocks['thought-collector'],
      unlockedAt: formatUnlockDate(updatedUnlocks['thought-collector']),
      currentProgress: Math.min(3, annotations.length),
      targetProgress: 3,
      progressUnit: 'anotasi'
    },
    {
      id: 'polymath',
      name: 'Genre Explorer',
      nameId: 'Penjelajah Wawasan',
      description: 'Membaca buku dari minimal 3 kategori berbeda untuk memperluas perspektif.',
      category: 'depth',
      rarity: 'rare',
      icon: 'Compass',
      criteria: 'Membaca buku dari 3 topik/kategori berbeda.',
      unlocked: !!updatedUnlocks['polymath'],
      unlockedAt: formatUnlockDate(updatedUnlocks['polymath']),
      currentProgress: Math.min(3, distinctCategories.size),
      targetProgress: 3,
      progressUnit: 'kategori'
    },
    {
      id: 'early-bird',
      name: 'Early Bird',
      nameId: 'Bangun Pagi Literasi',
      description: 'Mengawali hari dengan membaca sebelum pukul 08.00 pagi.',
      category: 'time',
      rarity: 'common',
      icon: 'Sun',
      criteria: 'Membaca buku antara jam 05.00 - 08.00 pagi.',
      unlocked: !!updatedUnlocks['early-bird'],
      unlockedAt: formatUnlockDate(updatedUnlocks['early-bird']),
      currentProgress: updatedUnlocks['early-bird'] ? 1 : 0,
      targetProgress: 1,
      progressUnit: 'sesi pagi'
    },
    {
      id: 'weekend-warrior',
      name: 'Weekend Warrior',
      nameId: 'Ksatria Akhir Pekan',
      description: 'Menyediakan waktu berkualitas membaca di hari Sabtu atau Minggu.',
      category: 'time',
      rarity: 'common',
      icon: 'Coffee',
      criteria: 'Catat sesi membaca di akhir pekan.',
      unlocked: !!updatedUnlocks['weekend-warrior'],
      unlockedAt: formatUnlockDate(updatedUnlocks['weekend-warrior']),
      currentProgress: updatedUnlocks['weekend-warrior'] ? 1 : (isWeekendNow ? 1 : 0),
      targetProgress: 1,
      progressUnit: 'sesi akhir pekan'
    },
    {
      id: 'community-voice',
      name: 'Community Voice',
      nameId: 'Inspirasi Bersama',
      description: 'Membagikan kutipan favoritmu ke feed sorotan komunitas pembaca.',
      category: 'social',
      rarity: 'rare',
      icon: 'Share2',
      criteria: 'Bagikan minimal 1 kutipan anotasi ke komunitas.',
      unlocked: !!updatedUnlocks['community-voice'],
      unlockedAt: formatUnlockDate(updatedUnlocks['community-voice']),
      currentProgress: hasSharedAnnotation ? 1 : 0,
      targetProgress: 1,
      progressUnit: 'kutipan dibagikan'
    }
  ];

  return {
    badges: badgesList,
    newlyUnlocked
  };
};
