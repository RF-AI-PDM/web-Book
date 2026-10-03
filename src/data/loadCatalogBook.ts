import type { Book } from '../types';

const loadedBooks = new Map<string, Promise<Book>>();

export function loadCatalogBook(book: Book): Promise<Book> {
  if (!book.sourceUrl) return Promise.resolve(book);

  let pending = loadedBooks.get(book.id);
  if (!pending) {
    pending = (async () => {
      const response = await fetch(book.sourceUrl!);
      if (!response.ok) throw new Error(`Gagal memuat dokumen (${response.status}).`);
      const blob = await response.blob();
      const fileName = decodeURIComponent(new URL(book.sourceUrl!, window.location.href).pathname.split('/').pop() || `${book.id}${book.fileType}`);
      const file = new File([blob], fileName, { type: book.fileType === '.pdf' ? 'application/pdf' : 'application/epub+zip' });
      const { parseUploadedDocument } = await import('../utils/documentParser');
      const parsed = await parseUploadedDocument(file);
      const { persistDocumentAssets } = await import('../lib/documentAssetPersistence');
      await persistDocumentAssets(book.id, parsed.assets, parsed.assetBlobs);
      if (parsed.chapters.length === 0) throw new Error('Dokumen tidak memiliki teks yang bisa dibaca.');
      return {
        ...book,
        author: book.author === 'Penulis dokumen' ? parsed.author : book.author,
        readTimeMinutes: parsed.estimatedReadTimeMinutes,
        chapters: parsed.chapters,
        assets: parsed.assets,
      };
    })().catch(error => {
      loadedBooks.delete(book.id);
      throw error;
    });
    loadedBooks.set(book.id, pending);
  }
  return pending;
}
