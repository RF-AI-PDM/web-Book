import { describe, expect, it } from 'vitest';
import { BOOKS_DATA, CATEGORIES, LEGACY_SAMPLE_BOOK_IDS } from './books';

describe('document catalog', () => {
  it('contains only the five bundled PDF and EPUB books', () => {
    expect(BOOKS_DATA).toHaveLength(5);
    expect(new Set(BOOKS_DATA.map(book => book.id)).size).toBe(5);
    expect(BOOKS_DATA.filter(book => book.fileType === '.pdf')).toHaveLength(3);
    expect(BOOKS_DATA.filter(book => book.fileType === '.epub')).toHaveLength(2);
    for (const book of BOOKS_DATA) {
      expect(book.sourceUrl).toMatch(/\.(pdf|epub)$/);
      expect(book.chapters).toEqual([]);
      expect(LEGACY_SAMPLE_BOOK_IDS.has(book.id)).toBe(false);
      expect(CATEGORIES.some(category => category.id === book.category)).toBe(true);
    }
  });
});
