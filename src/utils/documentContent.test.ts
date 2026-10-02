import { describe, expect, it } from 'vitest';
import type { Chapter, ContentBlock } from '../types';
import {
  getChapterBlocks,
  isContentBlock,
  LEGACY_DOCUMENT_SCHEMA_VERSION,
  STRUCTURED_DOCUMENT_SCHEMA_VERSION,
} from './documentContent';

describe('getChapterBlocks', () => {
  it('converts legacy paragraph content into deterministic structured blocks', () => {
    const chapter: Chapter = {
      id: 'intro',
      number: 1,
      title: 'Pendahuluan',
      readTimeMinutes: 3,
      content: ['Paragraf pertama.', 'Paragraf kedua.'],
    };

    expect(getChapterBlocks(chapter)).toEqual([
      { id: 'intro-paragraph-1', type: 'paragraph', text: 'Paragraf pertama.' },
      { id: 'intro-paragraph-2', type: 'paragraph', text: 'Paragraf kedua.' },
    ]);
    expect(chapter.blocks).toBeUndefined();
  });

  it('prefers structured blocks without cloning or rewriting them', () => {
    const blocks: ContentBlock[] = [
      { id: 'heading-1', type: 'heading', level: 2, text: 'Ide Utama' },
      { id: 'image-1', type: 'image', assetId: 'asset-cover', alt: 'Diagram konsep' },
    ];
    const chapter: Chapter = {
      id: 'chapter-1',
      number: 1,
      title: 'Bab 1',
      readTimeMinutes: 5,
      content: ['Fallback lama'],
      blocks,
    };

    expect(getChapterBlocks(chapter)).toBe(blocks);
  });

  it('ignores blank legacy paragraphs while retaining stable source indexes', () => {
    const chapter: Chapter = {
      id: 'chapter with spaces',
      number: 1,
      title: 'Bab 1',
      readTimeMinutes: 2,
      content: [' Isi ', '   ', 'Akhir'],
    };

    expect(getChapterBlocks(chapter)).toEqual([
      { id: 'chapter-with-spaces-paragraph-1', type: 'paragraph', text: 'Isi' },
      { id: 'chapter-with-spaces-paragraph-3', type: 'paragraph', text: 'Akhir' },
    ]);
  });
});

describe('isContentBlock', () => {
  it('accepts supported block shapes and rejects unsafe or incomplete values', () => {
    expect(isContentBlock({ id: 'p1', type: 'paragraph', text: 'Aman' })).toBe(true);
    expect(isContentBlock({ id: 'h1', type: 'heading', level: 4, text: 'Salah' })).toBe(false);
    expect(isContentBlock({ id: 'img1', type: 'image', assetId: '', alt: 'Kosong' })).toBe(false);
    expect(isContentBlock({ id: 'html1', type: 'html', html: '<script />' })).toBe(false);
    expect(isContentBlock(null)).toBe(false);
  });
});

describe('document schema versions', () => {
  it('keeps legacy and structured schema versions explicit', () => {
    expect(LEGACY_DOCUMENT_SCHEMA_VERSION).toBe(1);
    expect(STRUCTURED_DOCUMENT_SCHEMA_VERSION).toBe(2);
  });
});
