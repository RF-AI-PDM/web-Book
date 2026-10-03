import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { ContentBlock } from '../types';
import { DocumentBlockRenderer } from './DocumentBlockRenderer';

describe('DocumentBlockRenderer', () => {
  it('renders semantic reading blocks and delegates images to the asset resolver', () => {
    const blocks: ContentBlock[] = [
      { id: 'heading', type: 'heading', level: 2, text: 'Judul bab' },
      { id: 'paragraph', type: 'paragraph', text: 'Isi paragraf.', align: 'justify' },
      { id: 'list', type: 'list', ordered: true, items: ['Satu', 'Dua'] },
      { id: 'quote', type: 'quote', text: 'Kutipan penting.', attribution: 'Penulis' },
      { id: 'image', type: 'image', assetId: 'diagram', alt: 'Diagram proses', caption: 'Alur proses' },
      { id: 'break', type: 'pageBreak', pageNumber: 2 },
    ];

    const markup = renderToStaticMarkup(React.createElement(DocumentBlockRenderer, { bookId: 'book-1', blocks }));

    expect(markup).toContain('<h2');
    expect(markup).toContain('Judul bab');
    expect(markup).toContain('<ol');
    expect(markup).toContain('<blockquote');
    expect(markup).toContain('Alur proses');
    expect(markup).toContain('Halaman 2');
  });
});
