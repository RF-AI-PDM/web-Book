import { describe, it, expect } from 'vitest';
import { convertRawTextToChapters } from './documentParser';

describe('convertRawTextToChapters', () => {
  it('splits on detected chapter markers ("Bab N")', () => {
    const text = [
      'Bab 1: Pendahuluan',
      'Ini adalah paragraf pembuka yang cukup panjang untuk dihitung sebagai isi.',
      '',
      'Bab 2: Pengembangan',
      'Paragraf kedua membahas pengembangan konsep secara lebih mendalam.',
    ].join('\n');

    const chapters = convertRawTextToChapters(text, 'Test Doc');
    expect(chapters.length).toBeGreaterThanOrEqual(2);
    expect(chapters[0].title).toMatch(/Bab 1/i);
    expect(chapters[1].title).toMatch(/Bab 2/i);
  });

  it('falls back to auto-chunking by word count when no headings are found', () => {
    const paragraph = 'kata '.repeat(50).trim();
    const text = Array.from({ length: 40 }, () => paragraph).join('\n\n');

    const chapters = convertRawTextToChapters(text, 'Test Doc', 300);
    // ~2000 words at 300 words/chapter should produce multiple chunks
    expect(chapters.length).toBeGreaterThan(1);
    chapters.forEach(ch => {
      expect(ch.content.length).toBeGreaterThan(0);
    });
  });

  it('never returns an empty chapter list, even for empty input', () => {
    const chapters = convertRawTextToChapters('', 'Empty Doc');
    expect(chapters.length).toBeGreaterThanOrEqual(1);
  });

  it('every chapter gets a unique id', () => {
    const text = 'Bab 1\nIsi satu.\n\nBab 2\nIsi dua.\n\nBab 3\nIsi tiga.';
    const chapters = convertRawTextToChapters(text, 'Test Doc');
    const ids = chapters.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
