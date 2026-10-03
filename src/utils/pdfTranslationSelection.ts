export const MAX_PDF_SELECTION_LENGTH = 2000;
const MIN_PDF_SELECTION_LENGTH = 3;

export function normalizePdfSelection(rawSelection: string): string | null {
  const normalized = rawSelection.replace(/\s+/g, ' ').trim();
  if (normalized.length < MIN_PDF_SELECTION_LENGTH) return null;
  return normalized.slice(0, MAX_PDF_SELECTION_LENGTH);
}

interface BotDongTranslationInput {
  bookTitle: string;
  author: string;
  category: string;
  pageNumber: number;
  selectedText: string;
}

export function buildBotDongTranslationRequest(input: BotDongTranslationInput) {
  return {
    bookTitle: input.bookTitle,
    author: input.author,
    category: input.category,
    chapterTitle: `Halaman PDF ${input.pageNumber}`,
    highlightedText: input.selectedText,
    userQuery: [
      'Bertindak sebagai BotDong.read.',
      'Terjemahkan hanya teks yang dipilih pembaca ke Bahasa Indonesia.',
      'Pertahankan makna, istilah teknis, angka, satuan, dan struktur kalimat sumber.',
      'Jangan menambahkan analisis, ringkasan, atau teks di luar hasil terjemahan.',
    ].join(' '),
  };
}
