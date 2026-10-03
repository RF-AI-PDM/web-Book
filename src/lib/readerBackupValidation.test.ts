import { describe, expect, it } from 'vitest';
import { validateReaderBackup } from './readerBackupValidation';

describe('reader backup validation', () => {
  it('accepts legacy reader backups and ignores subscription grants', () => {
    expect(validateReaderBackup({ version: '1.2', savedBooks: [], subscription: { tier: 'vip_yearly' } })).toBe(true);
  });
  it('rejects malformed data before any persisted state is changed', () => {
    for (const data of [null, {}, { savedBooks: [null] }, { savedBooks: [], completedBookIds: 'wrong' },
      { savedBooks: [], annotations: [{ selectedText: 5 }] }, { savedBooks: [], completedCount: -1 },
      { savedBooks: [], dailyReadingLogs: { today: 'many' } }, { savedBooks: [], customBooks: [{ id: 'x', chapters: [] }] },
      { savedBooks: [], readingGoal: { targetMinutesPerDay: 0, mode: 'daily' } },
    ]) expect(validateReaderBackup(data)).toBe(false);
  });
});
