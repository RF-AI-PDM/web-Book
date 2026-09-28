import { ReadingGoal, DayReadingLog } from '../types';

export const getLocalDateString = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateString = (dateStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// Monday as starting day of week
export const getCurrentWeekDates = (referenceDate: Date = new Date()): string[] => {
  const d = new Date(referenceDate);
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  // Distance to Monday (if Sunday (0), distance is -6; else 1 - dayOfWeek)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    dates.push(getLocalDateString(nextDay));
  }
  return dates;
};

export const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
export const DAY_FULL_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const getDayShortName = (dateStr: string): string => {
  const d = parseDateString(dateStr);
  return DAY_NAMES_ID[d.getDay()];
};

export const getDayFullName = (dateStr: string): string => {
  const d = parseDateString(dateStr);
  return DAY_FULL_NAMES_ID[d.getDay()];
};

export const calculateStreak = (
  logs: Record<string, number>,
  targetMinutes: number,
  todayStr: string = getLocalDateString()
): number => {
  // Guard the unbounded while-loop below: if targetMinutes were ever <= 0,
  // "0 minutes logged" would satisfy the goal for every day and the loop
  // would never terminate.
  const target = Math.max(1, targetMinutes);
  let streak = 0;
  const todayMinutes = logs[todayStr] || 0;
  
  // If today's goal is already met, count today
  const hasMetToday = todayMinutes >= target;
  if (hasMetToday) {
    streak++;
  }

  // Check previous days consecutively
  const cursor = parseDateString(todayStr);
  // Start from yesterday
  cursor.setDate(cursor.getDate() - 1);

  while (true) {
    const dateStr = getLocalDateString(cursor);
    const dayMin = logs[dateStr] || 0;
    if (dayMin >= target) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export interface StreakDayHistory {
  date: string;
  dayShort: string;
  dayFull: string;
  dayOfMonth: number;
  monthName: string;
  minutes: number;
  targetMinutes: number;
  targetMet: boolean;
  isToday: boolean;
  partOfCurrentStreak: boolean;
}

export interface StreakMilestone {
  id: string;
  days: number;
  title: string;
  subtitle: string;
  unlocked: boolean;
}

export const STREAK_MILESTONES_CONFIG = [
  { id: 'spark', days: 3, title: 'Percikan Awal', subtitle: '3 hari beruntun membaca' },
  { id: 'week', days: 7, title: 'Minggu Emas', subtitle: '7 hari disiplin membaca' },
  { id: 'habit', days: 14, title: 'Kebiasaan Kuat', subtitle: '14 hari konsisten tanpa putus' },
  { id: 'master', days: 30, title: 'Pustakawan Sejati', subtitle: '30 hari dedikasi literasi' },
  { id: 'legend', days: 60, title: 'Master F15', subtitle: '60 hari penguasaan wawasan' }
];

export const getStreakMilestones = (currentStreak: number): {
  milestones: StreakMilestone[];
  currentTier: StreakMilestone | null;
  nextTier: StreakMilestone | null;
  progressToNextTierPercent: number;
  daysToNextTier: number;
} => {
  const milestones: StreakMilestone[] = STREAK_MILESTONES_CONFIG.map(m => ({
    ...m,
    unlocked: currentStreak >= m.days
  }));

  const unlockedList = milestones.filter(m => m.unlocked);
  const currentTier = unlockedList.length > 0 ? unlockedList[unlockedList.length - 1] : null;
  const nextTier = milestones.find(m => !m.unlocked) || null;

  let progressToNextTierPercent = 100;
  let daysToNextTier = 0;

  if (nextTier) {
    const prevThreshold = currentTier ? currentTier.days : 0;
    const requiredSpan = nextTier.days - prevThreshold;
    const currentProgress = Math.max(0, currentStreak - prevThreshold);
    progressToNextTierPercent = Math.min(100, Math.round((currentProgress / requiredSpan) * 100));
    daysToNextTier = Math.max(1, nextTier.days - currentStreak);
  }

  return {
    milestones,
    currentTier,
    nextTier,
    progressToNextTierPercent,
    daysToNextTier
  };
};

export const calculateLongestStreak = (
  logs: Record<string, number>,
  targetMinutes: number
): number => {
  const dates = Object.keys(logs).filter(d => (logs[d] || 0) >= targetMinutes);
  if (dates.length === 0) return 0;
  
  dates.sort(); // Lexicographical sort works for YYYY-MM-DD

  let maxStreak = 0;
  let currentRun = 0;
  let prevDate: Date | null = null;

  for (const dateStr of dates) {
    const currentDate = parseDateString(dateStr);
    
    if (prevDate) {
      const diffMs = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentRun++;
      } else if (diffDays > 1) {
        currentRun = 1;
      }
    } else {
      currentRun = 1;
    }

    if (currentRun > maxStreak) {
      maxStreak = currentRun;
    }
    prevDate = currentDate;
  }

  return maxStreak;
};

export const MONTH_NAMES_SHORT_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const getStreakHistory = (
  logs: Record<string, number>,
  targetMinutes: number,
  daysCount: number = 28
): StreakDayHistory[] => {
  const todayStr = getLocalDateString();
  const todayDate = parseDateString(todayStr);
  const currentStreak = calculateStreak(logs, targetMinutes, todayStr);
  
  // Calculate which dates are part of the active streak
  const streakActiveDates = new Set<string>();
  if (currentStreak > 0) {
    const streakCursor = new Date(todayDate);
    // If today is not met, streak starts yesterday
    if ((logs[todayStr] || 0) < targetMinutes) {
      streakCursor.setDate(streakCursor.getDate() - 1);
    }
    for (let i = 0; i < currentStreak; i++) {
      streakActiveDates.add(getLocalDateString(streakCursor));
      streakCursor.setDate(streakCursor.getDate() - 1);
    }
  }

  const result: StreakDayHistory[] = [];
  // Go from (daysCount - 1) days ago up to today
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    const dateStr = getLocalDateString(d);
    const minutes = logs[dateStr] || 0;
    const targetMet = minutes >= targetMinutes;
    const isToday = dateStr === todayStr;

    result.push({
      date: dateStr,
      dayShort: DAY_NAMES_ID[d.getDay()],
      dayFull: DAY_FULL_NAMES_ID[d.getDay()],
      dayOfMonth: d.getDate(),
      monthName: MONTH_NAMES_SHORT_ID[d.getMonth()],
      minutes,
      targetMinutes,
      targetMet,
      isToday,
      partOfCurrentStreak: streakActiveDates.has(dateStr)
    });
  }

  return result;
};

export interface WeekDayProgress {
  date: string;
  dayShort: string;
  dayFull: string;
  dayOfMonth: number;
  minutes: number;
  targetMet: boolean;
  isToday: boolean;
}

export interface GoalProgressSummary {
  targetMinutesPerDay: number;
  mode: 'daily' | 'weekly';
  todayMinutes: number;
  todayTarget: number;
  todayPercent: number;
  todayRemainingMinutes: number;
  isTodayAchieved: boolean;
  weeklyMinutes: number;
  weeklyTarget: number;
  weeklyPercent: number;
  weeklyRemainingMinutes: number;
  weeklyDaysAchieved: number;
  currentStreak: number;
  longestStreak: number;
  totalAllTimeMinutes: number;
  weekDays: WeekDayProgress[];
}

export const computeGoalProgress = (
  goal: ReadingGoal,
  logs: Record<string, number>
): GoalProgressSummary => {
  const todayStr = getLocalDateString();
  const targetPerDay = Math.max(1, goal.targetMinutesPerDay || 15);
  const todayMinutes = logs[todayStr] || 0;
  const isTodayAchieved = todayMinutes >= targetPerDay;
  const todayPercent = Math.min(100, Math.round((todayMinutes / targetPerDay) * 100));
  const todayRemainingMinutes = Math.max(0, targetPerDay - todayMinutes);

  const currentWeekDates = getCurrentWeekDates();
  const weeklyTarget = targetPerDay * 7;
  
  let weeklyMinutes = 0;
  let weeklyDaysAchieved = 0;

  const weekDays: WeekDayProgress[] = currentWeekDates.map(dateStr => {
    const mins = logs[dateStr] || 0;
    const isToday = dateStr === todayStr;
    const targetMet = mins >= targetPerDay;
    const parsed = parseDateString(dateStr);

    weeklyMinutes += mins;
    if (targetMet) weeklyDaysAchieved++;

    return {
      date: dateStr,
      dayShort: DAY_NAMES_ID[parsed.getDay()],
      dayFull: DAY_FULL_NAMES_ID[parsed.getDay()],
      dayOfMonth: parsed.getDate(),
      minutes: mins,
      targetMet,
      isToday
    };
  });

  const weeklyPercent = Math.min(100, Math.round((weeklyMinutes / weeklyTarget) * 100));
  const weeklyRemainingMinutes = Math.max(0, weeklyTarget - weeklyMinutes);

  const currentStreak = calculateStreak(logs, targetPerDay, todayStr);
  const longestStreak = Math.max(currentStreak, calculateLongestStreak(logs, targetPerDay));

  const totalAllTimeMinutes = Object.values(logs).reduce((sum, m) => sum + (Number(m) || 0), 0);

  return {
    targetMinutesPerDay: targetPerDay,
    mode: goal.mode || 'daily',
    todayMinutes,
    todayTarget: targetPerDay,
    todayPercent,
    todayRemainingMinutes,
    isTodayAchieved,
    weeklyMinutes,
    weeklyTarget,
    weeklyPercent,
    weeklyRemainingMinutes,
    weeklyDaysAchieved,
    currentStreak,
    longestStreak,
    totalAllTimeMinutes,
    weekDays
  };
};

export const INITIAL_DEMO_LOGS: Record<string, number> = (() => {
  const today = new Date();
  const logs: Record<string, number> = {};
  
  // Set today: 12 minutes
  logs[getLocalDateString(today)] = 12;

  // Yesterday: 20 minutes (achieved)
  const d1 = new Date(today);
  d1.setDate(today.getDate() - 1);
  logs[getLocalDateString(d1)] = 20;

  // 2 days ago: 18 minutes (achieved)
  const d2 = new Date(today);
  d2.setDate(today.getDate() - 2);
  logs[getLocalDateString(d2)] = 18;

  // 3 days ago: 15 minutes (achieved)
  const d3 = new Date(today);
  d3.setDate(today.getDate() - 3);
  logs[getLocalDateString(d3)] = 15;

  // 4 days ago: 10 minutes
  const d4 = new Date(today);
  d4.setDate(today.getDate() - 4);
  logs[getLocalDateString(d4)] = 10;

  return logs;
})();
