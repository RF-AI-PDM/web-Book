import type { MentorRequest } from './gemini.ts';

const MAX_QUERY_LEN = 2000;
const MAX_SHORT_FIELD_LEN = 300;
const MAX_ANNOTATIONS = 5;
const MAX_ANNOTATION_LEN = 500;

type ValidationResult =
  | { ok: true; data: MentorRequest }
  | { ok: false; error: string };

function isNonEmptyString(v: unknown, maxLen: number): v is string {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= maxLen;
}

export function validateMentorRequest(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Request body tidak valid.' };
  }

  const b = body as Record<string, unknown>;

  if (!isNonEmptyString(b.bookTitle, MAX_SHORT_FIELD_LEN)) {
    return { ok: false, error: 'bookTitle wajib diisi.' };
  }
  if (!isNonEmptyString(b.author, MAX_SHORT_FIELD_LEN)) {
    return { ok: false, error: 'author wajib diisi.' };
  }
  if (!isNonEmptyString(b.category, MAX_SHORT_FIELD_LEN)) {
    return { ok: false, error: 'category wajib diisi.' };
  }
  if (!isNonEmptyString(b.userQuery, MAX_QUERY_LEN)) {
    return { ok: false, error: `userQuery wajib diisi (maks ${MAX_QUERY_LEN} karakter).` };
  }
  if (b.chapterTitle !== undefined && !isNonEmptyString(b.chapterTitle, MAX_SHORT_FIELD_LEN)) {
    return { ok: false, error: 'chapterTitle tidak valid.' };
  }
  if (b.highlightedText !== undefined && !isNonEmptyString(b.highlightedText, MAX_QUERY_LEN)) {
    return { ok: false, error: 'highlightedText tidak valid.' };
  }

  let annotationsContext: string[] | undefined;
  if (b.annotationsContext !== undefined) {
    if (!Array.isArray(b.annotationsContext)) {
      return { ok: false, error: 'annotationsContext tidak valid.' };
    }
    annotationsContext = b.annotationsContext
      .slice(0, MAX_ANNOTATIONS)
      .filter((x): x is string => typeof x === 'string')
      .map(x => x.slice(0, MAX_ANNOTATION_LEN));
  }

  return {
    ok: true,
    data: {
      bookTitle: (b.bookTitle as string).trim(),
      author: (b.author as string).trim(),
      category: (b.category as string).trim(),
      chapterTitle: typeof b.chapterTitle === 'string' ? b.chapterTitle.trim() : undefined,
      highlightedText: typeof b.highlightedText === 'string' ? b.highlightedText.trim() : undefined,
      userQuery: (b.userQuery as string).trim(),
      annotationsContext,
    },
  };
}
