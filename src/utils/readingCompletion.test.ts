import { describe, expect, it } from 'vitest';
import { recordCompletedBook } from './readingCompletion';

describe('book completion', () => {
  it('counts a book only once, including a repeated completion after going back a chapter', () => {
    const completed = new Set<string>();
    expect(recordCompletedBook(completed, 'book', 99)).toBe(false);
    expect(recordCompletedBook(completed, 'book', 100)).toBe(true);
    expect(recordCompletedBook(completed, 'book', 100)).toBe(false);
    expect(recordCompletedBook(completed, 'book', 50)).toBe(false);
    expect(recordCompletedBook(completed, 'book', 100)).toBe(false);
    expect(recordCompletedBook(completed, 'other', 100)).toBe(true);
  });
});
