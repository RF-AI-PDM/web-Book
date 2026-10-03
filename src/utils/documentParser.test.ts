import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { JSDOM } from 'jsdom';
import { convertRawTextToChapters, parseEpubFile } from './documentParser';

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

describe('parseEpubFile', () => {
  it('keeps XHTML reading structure and extracts nested image assets without temporary URLs', async () => {
    const zip = new JSZip();
    zip.file('META-INF/container.xml', `<?xml version="1.0"?><container><rootfiles><rootfile full-path="OPS/book.opf"/></rootfiles></container>`);
    zip.file('OPS/book.opf', `<?xml version="1.0"?><package><metadata><dc:title xmlns:dc="urn:dc">Buku Uji</dc:title></metadata><manifest><item id="chapter" href="Text/chapter-1.xhtml"/><item id="diagram" href="Images/diagram%20one.png"/></manifest><spine><itemref idref="chapter"/></spine></package>`);
    zip.file('OPS/Text/chapter-1.xhtml', `<!doctype html><html><body><h1>Pengantar Sistem</h1><p>Paragraf pembuka dengan isi yang cukup panjang untuk menjadi bagian dari dokumen terstruktur dan menjelaskan konteks awal pembahasan secara jelas.</p><p>Paragraf kedua menambahkan rincian penting agar bab EPUB memenuhi ambang isi minimal pembaca dan tetap menunjukkan urutan sumbernya.</p><blockquote>Catatan penting dari penulis.</blockquote><ol><li>Langkah pertama</li><li>Langkah kedua</li></ol><figure><img src="../Images/diagram%20one.png" alt="Diagram proses"/><figcaption>Alur proses</figcaption></figure><script>window.unsupported = true</script></body></html>`);
    zip.file('OPS/Images/diagram one.png', new Uint8Array([137, 80, 78, 71]));
    const bytes = await zip.generateAsync({ type: 'arraybuffer' });
    const dom = new JSDOM('');
    const originalDomParser = globalThis.DOMParser;
    globalThis.DOMParser = dom.window.DOMParser as unknown as typeof DOMParser;

    try {
      const result = await parseEpubFile({ name: 'buku-uji.epub', arrayBuffer: async () => bytes } as File);
      const blocks = result.chapters[0].blocks || [];

      expect(blocks.some(block => block.type === 'heading' && block.text === 'Pengantar Sistem')).toBe(true);
      expect(blocks.filter(block => block.type === 'paragraph')).toHaveLength(2);
      expect(blocks.some(block => block.type === 'quote' && block.text === 'Catatan penting dari penulis.')).toBe(true);
      expect(blocks.some(block => block.type === 'list' && block.items.length === 2)).toBe(true);
      expect(blocks.some(block => block.type === 'image' && block.assetId === 'epub-ch-1-image-1')).toBe(true);
      expect(blocks.some(block => 'text' in block && block.text.includes('window.unsupported'))).toBe(false);
      expect(result.assets[0]?.sourceUrl).toBeUndefined();
      expect(result.assetBlobs.get('epub-ch-1-image-1')?.size).toBe(4);
    } finally {
      globalThis.DOMParser = originalDomParser;
      dom.window.close();
    }
  });
});
