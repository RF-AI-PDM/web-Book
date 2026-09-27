import { Book, Chapter } from '../types';

// mammoth, pdfjs-dist, and jszip are heavy (they'd otherwise be the single
// largest chunk of the main bundle) and are only ever needed when a user
// actually uploads a matching file type, so they're loaded on demand below
// instead of imported at module scope.

let pdfWorkerConfigured = false;
async function loadPdfjs() {
  const pdfjsLib = await import('pdfjs-dist');
  if (!pdfWorkerConfigured && typeof window !== 'undefined') {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;
      pdfWorkerConfigured = true;
    } catch (e) {
      console.warn('PDF.js worker setup fallback:', e);
    }
  }
  return pdfjsLib;
}

export interface ParsedDocumentResult {
  title: string;
  author: string;
  category: string;
  summary: string;
  chapters: Chapter[];
  totalPagesOrSections: number;
  wordCount: number;
  estimatedReadTimeMinutes: number;
  fileName: string;
  fileType: string;
}

/**
 * Split text into paragraphs and group into 15-minute chapters (~1,200 words per chapter)
 */
export function convertRawTextToChapters(
  rawText: string, 
  documentTitle: string,
  wordsPerChapter: number = 1200
): Chapter[] {
  const cleanedText = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = cleanedText.split('\n');
  
  // Try detecting existing chapter markings (e.g., "BAB 1", "Chapter 1", "# Bab", "Bagian 1")
  const chapterRegex = /^(?:bab|chapter|bagian|part|sekte)\s+([0-9ivxlcdm]+|[a-z]+)[:.\s-]*(.*)$/i;
  const headingRegex = /^#{1,3}\s+(.+)$/;

  const detectedSections: { title: string; paragraphs: string[] }[] = [];
  let currentSectionTitle = 'Pendahuluan & Pengantar';
  let currentParagraphs: string[] = [];
  let bufferParagraph = '';

  const flushParagraph = () => {
    if (bufferParagraph.trim().length > 0) {
      currentParagraphs.push(bufferParagraph.trim());
      bufferParagraph = '';
    }
  };

  const flushSection = (nextTitle: string) => {
    flushParagraph();
    if (currentParagraphs.length > 0) {
      detectedSections.push({
        title: currentSectionTitle,
        paragraphs: [...currentParagraphs]
      });
      currentParagraphs = [];
    }
    currentSectionTitle = nextTitle;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Check if line looks like a chapter or markdown heading
    const isChapter = chapterRegex.test(trimmed);
    const isHeading = headingRegex.test(trimmed);

    if (isChapter || (isHeading && trimmed.length < 80)) {
      const titleCandidate = isHeading 
        ? trimmed.replace(/^#{1,3}\s+/, '')
        : trimmed;
      flushSection(titleCandidate);
    } else {
      if (bufferParagraph) {
        bufferParagraph += ' ' + trimmed;
      } else {
        bufferParagraph = trimmed;
      }
    }
  }

  flushSection('Selesai');

  // If detected sections is too small or only 1 big section, auto-chunk by word count for 15-minute chunks
  if (detectedSections.length <= 1) {
    const allParagraphs = detectedSections[0]?.paragraphs || [];
    if (allParagraphs.length === 0 && cleanedText.trim()) {
      allParagraphs.push(...cleanedText.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean));
    }

    const chunkedChapters: Chapter[] = [];
    let currentWords = 0;
    let currentChunk: string[] = [];
    let chapterIndex = 1;

    for (const para of allParagraphs) {
      const paraWords = para.split(/\s+/).length;
      if (currentWords + paraWords > wordsPerChapter && currentChunk.length > 0) {
        chunkedChapters.push({
          id: `ch-${chapterIndex}`,
          number: chapterIndex,
          title: `Bagian ${chapterIndex}: Intisari & Eksplorasi Pokok`,
          readTimeMinutes: Math.max(8, Math.round(currentWords / 150)),
          content: [...currentChunk],
          keyQuote: currentChunk[0]?.slice(0, 140) + '...',
          actionItem: 'Terapkan konsep penting dari bagian ini pada aktivitas harian Anda.'
        });
        chapterIndex++;
        currentChunk = [para];
        currentWords = paraWords;
      } else {
        currentChunk.push(para);
        currentWords += paraWords;
      }
    }

    if (currentChunk.length > 0) {
      chunkedChapters.push({
        id: `ch-${chapterIndex}`,
        number: chapterIndex,
        title: chapterIndex === 1 ? 'Intisari Lengkap Dokumen' : `Bagian ${chapterIndex}: Ringkasan & Konklusi`,
        readTimeMinutes: Math.max(5, Math.round(currentWords / 150)),
        content: currentChunk,
        keyQuote: currentChunk[0]?.slice(0, 140) + '...',
        actionItem: 'Refleksikan wawasan kunci ini ke dalam jurnal membaca Anda.'
      });
    }

    return chunkedChapters.length > 0 ? chunkedChapters : [{
      id: 'ch-1',
      number: 1,
      title: 'Isi Dokumen',
      readTimeMinutes: 15,
      content: ['Tidak ada teks yang dapat diekstrak dari dokumen ini.'],
      keyQuote: 'Dokumen kosong.',
      actionItem: 'Periksa file sumber.'
    }];
  }

  // Convert detected sections to Chapters
  return detectedSections.map((sec, idx) => {
    const wordCount = sec.paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0);
    return {
      id: `sec-${idx + 1}`,
      number: idx + 1,
      title: sec.title || `Bagian ${idx + 1}`,
      readTimeMinutes: Math.max(5, Math.min(25, Math.round(wordCount / 140))),
      content: sec.paragraphs.length > 0 ? sec.paragraphs : ['(Bagian ini tidak memiliki teks isi).'],
      keyQuote: sec.paragraphs[0] ? sec.paragraphs[0].slice(0, 140) + '...' : undefined,
      actionItem: 'Tandai bagian penting dengan fitur sorotan warna.'
    };
  });
}

/**
 * Extract text from PDF File using pdfjsLib
 */
export async function parsePdfFile(file: File): Promise<string> {
  const pdfjsLib = await loadPdfjs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const pageStrings = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    fullText += `\n\n[Halaman ${i}]\n` + pageStrings;
  }

  return fullText.trim();
}

/**
 * Extract text from DOCX File using mammoth
 */
export async function parseDocxFile(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

/**
 * Extract text from TXT or Markdown File
 */
export async function parsePlainTextFile(file: File): Promise<string> {
  return await file.text();
}

/**
 * Extract content and metadata from EPUB File using JSZip & DOMParser
 */
export async function parseEpubFile(file: File): Promise<{
  title?: string;
  author?: string;
  description?: string;
  chapters: Chapter[];
  fullText: string;
}> {
  const { default: JSZip } = await import('jszip');
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // 1. Find container.xml to locate OPF file
  const containerXmlStr = await zip.file('META-INF/container.xml')?.async('text');
  let opfPath = 'content.opf';
  if (containerXmlStr) {
    const parser = new DOMParser();
    const containerDoc = parser.parseFromString(containerXmlStr, 'application/xml');
    const rootfile = containerDoc.querySelector('rootfile');
    if (rootfile && rootfile.getAttribute('full-path')) {
      opfPath = rootfile.getAttribute('full-path')!;
    }
  }

  // Fallback: search for any .opf file in zip if not found
  let opfFile = zip.file(opfPath);
  if (!opfFile) {
    const foundOpf = zip.file(/\.opf$/i)[0];
    if (foundOpf) {
      opfPath = foundOpf.name;
      opfFile = foundOpf;
    }
  }

  if (!opfFile) {
    throw new Error('Format file EPUB tidak valid (tidak ditemukan file metadata OPF).');
  }

  const opfDir = opfPath.includes('/') ? opfPath.substring(0, opfPath.lastIndexOf('/') + 1) : '';
  const opfContent = await opfFile.async('text');
  const parser = new DOMParser();
  const opfDoc = parser.parseFromString(opfContent, 'application/xml');

  // Metadata
  const title = opfDoc.querySelector('title, dc\\:title')?.textContent?.trim() || undefined;
  const author = opfDoc.querySelector('creator, dc\\:creator')?.textContent?.trim() || undefined;
  const description = opfDoc.querySelector('description, dc\\:description')?.textContent?.trim() || undefined;

  // Manifest items map (id -> full zip path)
  const manifestMap: Record<string, string> = {};
  opfDoc.querySelectorAll('manifest > item').forEach(item => {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (id && href) {
      const cleanHref = decodeURIComponent(href);
      const fullPath = opfDir + cleanHref;
      manifestMap[id] = fullPath;
    }
  });

  // Spine items (ordered reading list)
  const spineItems: string[] = [];
  opfDoc.querySelectorAll('spine > itemref').forEach(itemref => {
    const idref = itemref.getAttribute('idref');
    if (idref && manifestMap[idref]) {
      spineItems.push(manifestMap[idref]);
    }
  });

  const parsedChapters: Chapter[] = [];
  let fullTextCombined = '';
  let chapterIndex = 1;

  for (const itemPath of spineItems) {
    const chapterFile = zip.file(itemPath) || zip.file(itemPath.replace(/\\/g, '/'));
    if (!chapterFile) continue;

    const xhtmlStr = await chapterFile.async('text');
    const doc = parser.parseFromString(xhtmlStr, 'text/html');

    // Extract title if available
    let heading = doc.querySelector('h1, h2, h3, title')?.textContent?.trim();
    if (!heading || heading.length > 90) {
      heading = `Bagian ${chapterIndex}`;
    }

    // Extract readable paragraphs
    const paragraphs: string[] = [];
    const elements = doc.querySelectorAll('p, blockquote, li, div');
    elements.forEach(el => {
      if (el.tagName.toLowerCase() === 'div' && el.querySelector('p')) {
        return;
      }
      const text = el.textContent?.trim();
      if (text && text.length > 15) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      const chapterWords = paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0);
      if (chapterWords > 20) {
        parsedChapters.push({
          id: `epub-ch-${chapterIndex}`,
          number: chapterIndex,
          title: heading,
          readTimeMinutes: Math.max(3, Math.round(chapterWords / 150)),
          content: paragraphs,
          keyQuote: paragraphs[0] ? paragraphs[0].slice(0, 140) + '...' : undefined,
          actionItem: 'Tandai wawasan kunci dari bab ini untuk diterapkan.'
        });
        chapterIndex++;
        fullTextCombined += `\n\n# ${heading}\n` + paragraphs.join('\n\n');
      }
    }
  }

  return {
    title,
    author,
    description,
    chapters: parsedChapters,
    fullText: fullTextCombined.trim()
  };
}

/**
 * Main parser entry point supporting PDF, DOCX, EPUB, TXT, MD
 */
export async function parseUploadedDocument(file: File): Promise<ParsedDocumentResult> {
  const fileName = file.name;
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  let rawText = '';
  let customTitle: string | undefined;
  let customAuthor: string | undefined;
  let customSummary: string | undefined;
  let customChapters: Chapter[] | undefined;

  if (extension === '.pdf') {
    rawText = await parsePdfFile(file);
  } else if (extension === '.docx' || extension === '.doc') {
    rawText = await parseDocxFile(file);
  } else if (extension === '.epub') {
    const epubResult = await parseEpubFile(file);
    customTitle = epubResult.title;
    customAuthor = epubResult.author;
    customSummary = epubResult.description;
    if (epubResult.chapters.length > 0) {
      customChapters = epubResult.chapters;
    }
    rawText = epubResult.fullText;
  } else if (['.txt', '.md', '.markdown', '.json', '.html'].includes(extension)) {
    rawText = await parsePlainTextFile(file);
  } else {
    // Fallback try reading as text
    try {
      rawText = await parsePlainTextFile(file);
    } catch {
      throw new Error(`Format file "${extension}" tidak didukung. Harap gunakan PDF, DOCX, EPUB, TXT, atau Markdown.`);
    }
  }

  if ((!rawText || rawText.trim().length < 20) && (!customChapters || customChapters.length === 0)) {
    throw new Error('Dokumen tampaknya kosong atau berformat gambar tanpa layer teks. Harap gunakan file dengan teks digital.');
  }

  // Derive title from metadata or filename
  const cleanTitle = customTitle || fileName
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  const words = (rawText || '').split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const estimatedReadTimeMinutes = Math.max(5, Math.round(wordCount / 160));

  // Build chapters if not pre-extracted
  const chapters = (customChapters && customChapters.length > 0)
    ? customChapters
    : convertRawTextToChapters(rawText, cleanTitle, 1200);

  // Generate an executive preview summary
  const firstParagraphs = chapters[0]?.content.slice(0, 3).join(' ') || '';
  const summary = customSummary || (firstParagraphs.length > 280 
    ? firstParagraphs.slice(0, 280).trim() + '...'
    : firstParagraphs || `Buku/dokumen yang diunggah ke F15 Library: ${cleanTitle}.`);

  return {
    title: cleanTitle,
    author: customAuthor || 'Penulis Dokumen',
    category: 'Buku Unggahan',
    summary,
    chapters,
    totalPagesOrSections: chapters.length,
    wordCount,
    estimatedReadTimeMinutes,
    fileName,
    fileType: extension
  };
}

const PALETTES = [
  'from-amber-600 via-stone-800 to-black',
  'from-emerald-700 via-teal-900 to-stone-950',
  'from-indigo-700 via-purple-950 to-stone-950',
  'from-blue-700 via-cyan-950 to-stone-950',
  'from-rose-700 via-red-950 to-stone-950',
  'from-orange-600 via-amber-950 to-stone-950'
];

/**
 * Convert ParsedDocumentResult into a fully compatible F15 Book object
 */
export function createF15BookFromUpload(
  doc: ParsedDocumentResult, 
  options?: {
    customCoverColor?: string;
    isPremium?: boolean;
    previewChaptersCount?: number;
    uploadedBy?: 'admin' | 'user';
    price?: number;
    category?: string;
    author?: string;
    title?: string;
  }
): Book {
  const randomPalette = options?.customCoverColor || PALETTES[Math.floor(Math.random() * PALETTES.length)];
  const bookId = `${options?.uploadedBy === 'admin' ? 'catalog' : 'user'}-doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = options?.title || doc.title;
  const author = options?.author || doc.author;
  const category = options?.category || doc.category;

  return {
    id: bookId,
    title,
    subtitle: `${doc.chapters.length} Bagian · ${doc.wordCount.toLocaleString('id-ID')} Kata · Format ${doc.fileType.toUpperCase()}`,
    author,
    category,
    readTimeMinutes: doc.estimatedReadTimeMinutes,
    description: doc.summary,
    coverColor: randomPalette,
    coverAccent: '#f97316',
    coverIcon: 'FileText',
    badge: options?.uploadedBy === 'admin' ? (options?.isPremium ? 'VIP Premium' : 'Katalog Baru') : 'Buku Unggahan',
    publishedYear: new Date().getFullYear(),
    chapters: doc.chapters,
    isPremium: options?.isPremium ?? false,
    previewChaptersCount: options?.previewChaptersCount ?? 2,
    uploadedBy: options?.uploadedBy ?? 'user',
    uploadedAt: new Date().toISOString(),
    fileType: doc.fileType,
    price: options?.price
  };
}
