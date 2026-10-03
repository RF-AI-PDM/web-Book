import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { Book } from '../types';
import { PdfTranslationWorkspace } from './PdfTranslationWorkspace';

const book = {
  id: 'power-systems',
  title: 'Power Systems',
  author: 'A. Engineer',
  category: 'Teknik',
  readTimeMinutes: 60,
  subtitle: 'Panduan',
  description: 'Dokumen PDF',
  coverColor: 'slate',
  coverAccent: 'blue',
  chapters: [],
  fileType: '.pdf',
  sourceUrl: '/documents/power-systems.pdf',
} satisfies Book;

describe('PdfTranslationWorkspace', () => {
  it('presents the original PDF and a BotDong.read panel for selected text only', () => {
    const markup = renderToStaticMarkup(React.createElement(PdfTranslationWorkspace, { book, onClose: () => undefined }));

    expect(markup).toContain('PDF asli');
    expect(markup).toContain('BotDong.read');
    expect(markup).toContain('Pilih teks di PDF');
    expect(markup).toContain('Terjemahkan pilihan');
  });
});
