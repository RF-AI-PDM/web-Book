import { describe, expect, it } from 'vitest';
import { buildBotDongTranslationRequest, normalizePdfSelection } from './pdfTranslationSelection';

describe('normalizePdfSelection', () => {
  it('trims and normalizes whitespace from selected PDF text', () => {
    expect(normalizePdfSelection('  Sistem\n\n pembangkit\t listrik  ')).toBe('Sistem pembangkit listrik');
  });

  it('rejects a selection that is too short to translate meaningfully', () => {
    expect(normalizePdfSelection('ok')).toBeNull();
  });

  it('limits a selection to the API-safe maximum length', () => {
    expect(normalizePdfSelection('a'.repeat(2501))).toHaveLength(2000);
  });
});

describe('buildBotDongTranslationRequest', () => {
  it('asks for a faithful Indonesian translation of only the selected source text', () => {
    const request = buildBotDongTranslationRequest({
      bookTitle: 'Power Systems',
      author: 'A. Engineer',
      category: 'Teknik',
      pageNumber: 12,
      selectedText: 'The transformer temperature is increasing.',
    });

    expect(request.highlightedText).toBe('The transformer temperature is increasing.');
    expect(request.chapterTitle).toBe('Halaman PDF 12');
    expect(request.userQuery).toMatch(/hanya teks yang dipilih/i);
    expect(request.userQuery).toMatch(/Bahasa Indonesia/i);
  });
});
