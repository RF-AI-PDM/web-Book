import type { Chapter, ContentBlock, TextAlignment } from '../types';

export const LEGACY_DOCUMENT_SCHEMA_VERSION = 1 as const;
export const STRUCTURED_DOCUMENT_SCHEMA_VERSION = 2 as const;

const TEXT_ALIGNMENTS = new Set<TextAlignment>(['left', 'center', 'right', 'justify']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalPositiveNumber(value: unknown): boolean {
  return value === undefined || (typeof value === 'number' && Number.isFinite(value) && value > 0);
}

export function isContentBlock(value: unknown): value is ContentBlock {
  if (!isRecord(value) || !isNonEmptyString(value.id) || typeof value.type !== 'string') return false;

  switch (value.type) {
    case 'heading':
      return (value.level === 1 || value.level === 2 || value.level === 3) && isNonEmptyString(value.text);
    case 'paragraph':
      return isNonEmptyString(value.text)
        && (value.align === undefined || TEXT_ALIGNMENTS.has(value.align as TextAlignment));
    case 'list':
      return typeof value.ordered === 'boolean' && Array.isArray(value.items)
        && value.items.length > 0 && value.items.every(isNonEmptyString);
    case 'quote':
      return isNonEmptyString(value.text)
        && (value.attribution === undefined || typeof value.attribution === 'string');
    case 'image':
      return isNonEmptyString(value.assetId) && typeof value.alt === 'string'
        && (value.caption === undefined || typeof value.caption === 'string')
        && isOptionalPositiveNumber(value.width) && isOptionalPositiveNumber(value.height);
    case 'pageBreak':
      return value.pageNumber === undefined
        || (Number.isInteger(value.pageNumber) && (value.pageNumber as number) > 0);
    default:
      return false;
  }
}

function normalizeIdPart(value: string): string {
  const normalized = value.trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return normalized || 'chapter';
}

/** Convert legacy paragraphs to stable blocks without mutating stored data. */
export function getChapterBlocks(chapter: Chapter): ContentBlock[] {
  if (Array.isArray(chapter.blocks) && chapter.blocks.length > 0) return chapter.blocks;

  const chapterId = normalizeIdPart(chapter.id);
  return chapter.content.flatMap((paragraph, index) => {
    const text = paragraph.trim();
    if (!text) return [];
    return [{ id: `${chapterId}-paragraph-${index + 1}`, type: 'paragraph' as const, text }];
  });
}
