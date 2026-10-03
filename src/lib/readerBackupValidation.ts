import type { Annotation, Book, ReadingGoal, SavedBook } from '../types';
import { isContentBlock } from '../utils/documentContent';

export interface ReaderBackupData {
  savedBooks: SavedBook[];
  annotations?: Annotation[];
  readingHistory?: SavedBook[];
  completedCount?: number;
  completedBookIds?: string[];
  readingGoal?: ReadingGoal;
  dailyReadingLogs?: Record<string, number>;
  customBooks?: Book[];
  documentAssets?: unknown;
}
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(item => typeof item === 'string');
const number = (v: unknown, min = 0, max = Infinity): v is number => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const stringFields = (v: Record<string, unknown>, fields: string[]) => fields.every(field => typeof v[field] === 'string');
const optionalArray = (v: unknown, check: (item: unknown) => boolean) => v === undefined || (Array.isArray(v) && v.every(check));

function savedBook(v: unknown): boolean {
  return record(v) && stringFields(v, ['bookId', 'title', 'author', 'category', 'currentChapterId', 'currentChapterTitle', 'savedAt', 'lastReadAt'])
    && number(v.progress, 0, 100) && typeof v.completed === 'boolean';
}
function annotation(v: unknown): boolean {
  if (!record(v) || !stringFields(v, ['id', 'userId', 'bookId', 'bookTitle', 'chapterId', 'chapterTitle', 'selectedText', 'createdAt'])
    || !['yellow', 'green', 'blue', 'purple', 'orange'].includes(String(v.color))
    || (v.note !== undefined && typeof v.note !== 'string')) return false;
  if (v.locator === undefined) return true;
  return record(v.locator) && stringFields(v.locator, ['textId', 'prefix', 'suffix'])
    && Number.isInteger(v.locator.start) && Number.isInteger(v.locator.end)
    && number(v.locator.start) && number(v.locator.end, v.locator.start + 1);
}
function book(v: unknown): boolean {
  if (!record(v) || !stringFields(v, ['id', 'title', 'author', 'category', 'subtitle', 'description', 'coverColor', 'coverAccent'])
    || !number(v.readTimeMinutes) || !Array.isArray(v.chapters) || !v.chapters.every(chapter => record(chapter)
      && stringFields(chapter, ['id', 'title']) && number(chapter.number, 1) && number(chapter.readTimeMinutes)
      && strings(chapter.content) && optionalArray(chapter.blocks, isContentBlock))) return false;
  return optionalArray(v.assets, asset => record(asset) && stringFields(asset, ['id', 'mediaType']) && number(asset.byteSize));
}

export function validateReaderBackup(v: unknown): v is ReaderBackupData {
  return record(v) && Array.isArray(v.savedBooks) && v.savedBooks.every(savedBook)
    && optionalArray(v.readingHistory, savedBook) && optionalArray(v.annotations, annotation)
    && (v.completedCount === undefined || (number(v.completedCount) && Number.isInteger(v.completedCount)))
    && (v.completedBookIds === undefined || strings(v.completedBookIds))
    && (v.readingGoal === undefined || (record(v.readingGoal) && number(v.readingGoal.targetMinutesPerDay, 1, 1440)
      && ['daily', 'weekly'].includes(String(v.readingGoal.mode))))
    && (v.dailyReadingLogs === undefined || (record(v.dailyReadingLogs) && Object.values(v.dailyReadingLogs).every(value => number(value))))
    && optionalArray(v.customBooks, book);
}
