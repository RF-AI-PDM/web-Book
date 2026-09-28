import { describe, it, expect } from 'vitest';
import {
  calculateStreak,
  calculateLongestStreak,
  computeGoalProgress,
  getCurrentWeekDates,
  getLocalDateString,
} from './readingGoalUtils';

function daysAgo(n: number, from = new Date('2026-09-23T00:00:00')): string {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return getLocalDateString(d);
}

describe('calculateStreak', () => {
  const today = '2026-09-23';

  it('counts 0 when nothing logged', () => {
    expect(calculateStreak({}, 15, today)).toBe(0);
  });

  it('counts today when today already met the goal', () => {
    const logs = { [today]: 20 };
    expect(calculateStreak(logs, 15, today)).toBe(1);
  });

  it('counts consecutive prior days even if today is not met yet', () => {
    const logs = {
      [daysAgo(1)]: 15,
      [daysAgo(2)]: 15,
      [daysAgo(3)]: 15,
    };
    expect(calculateStreak(logs, 15, today)).toBe(3);
  });

  it('stops at the first gap', () => {
    const logs = {
      [daysAgo(1)]: 15,
      [daysAgo(2)]: 15,
      // gap at daysAgo(3)
      [daysAgo(4)]: 15,
    };
    expect(calculateStreak(logs, 15, today)).toBe(2);
  });

  it('never infinite-loops even if targetMinutes is 0 or negative', () => {
    const logs = { [daysAgo(1)]: 0, [daysAgo(2)]: 0 };
    // Should terminate immediately instead of treating every day as met.
    expect(calculateStreak(logs, 0, today)).toBe(0);
    expect(calculateStreak(logs, -5, today)).toBe(0);
  });
});

describe('calculateLongestStreak', () => {
  it('returns 0 for empty logs', () => {
    expect(calculateLongestStreak({}, 15)).toBe(0);
  });

  it('finds the longest run even if it is not the most recent one', () => {
    const logs = {
      '2026-09-01': 15,
      '2026-09-02': 15,
      '2026-09-03': 15,
      '2026-09-04': 15,
      // gap
      '2026-09-10': 15,
      '2026-09-11': 15,
    };
    expect(calculateLongestStreak(logs, 15)).toBe(4);
  });
});

describe('getCurrentWeekDates', () => {
  it('returns 7 dates starting on Monday', () => {
    // 2026-09-23 is a Wednesday
    const dates = getCurrentWeekDates(new Date('2026-09-23T12:00:00'));
    expect(dates).toHaveLength(7);
    expect(dates[0]).toBe('2026-09-21'); // Monday
    expect(dates[6]).toBe('2026-09-27'); // Sunday
  });

  it('handles a reference date that is itself a Sunday', () => {
    const dates = getCurrentWeekDates(new Date('2026-09-27T12:00:00'));
    expect(dates[0]).toBe('2026-09-21');
    expect(dates[6]).toBe('2026-09-27');
  });
});

describe('computeGoalProgress', () => {
  it('falls back to a sane default when targetMinutesPerDay is missing/zero', () => {
    const progress = computeGoalProgress({ targetMinutesPerDay: 0, mode: 'daily' }, {});
    expect(progress.targetMinutesPerDay).toBe(15);
  });

  it('marks today achieved once minutes reach the target', () => {
    const today = getLocalDateString();
    const progress = computeGoalProgress(
      { targetMinutesPerDay: 15, mode: 'daily' },
      { [today]: 15 }
    );
    expect(progress.isTodayAchieved).toBe(true);
    expect(progress.todayRemainingMinutes).toBe(0);
  });

  it('never reports over 100% for today or the week', () => {
    const today = getLocalDateString();
    const progress = computeGoalProgress(
      { targetMinutesPerDay: 15, mode: 'daily' },
      { [today]: 500 }
    );
    expect(progress.todayPercent).toBeLessThanOrEqual(100);
    expect(progress.weeklyPercent).toBeLessThanOrEqual(100);
  });
});
