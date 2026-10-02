import type { Book } from '../types';

// Vite copies the original documents to the build and returns their public URLs.
const documentUrls = import.meta.glob('../../Dokumen/*.{pdf,epub}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

type CatalogEntry = Omit<Book, 'chapters' | 'readTimeMinutes' | 'sourceUrl'> & { fileName: string };

const entries: CatalogEntry[] = [
  {
    id: '30-agents-bahasa-indonesia', fileName: '30-Agents-Bahasa-Indonesia.pdf',
    title: '30 Agent yang Wajib Dibuat oleh Setiap AI Engineer', author: 'Imran Ahmad, PhD', category: 'Kecerdasan Buatan',
    subtitle: 'Edisi Bahasa Indonesia · 542 halaman PDF',
    description: 'Dokumen 30 Agents dalam Bahasa Indonesia. Buka untuk membaca isi lengkap dari berkas asli.',
    coverColor: '#142723', coverAccent: '#5eead4', coverIcon: 'cpu',
  },
  {
    id: 'langgraph-blueprint-indonesia', fileName: 'The-Complete-LangGraph-Blueprint-INDONESIA.pdf',
    title: 'The Complete LangGraph Blueprint', author: 'James Karanja Maina', category: 'Kecerdasan Buatan',
    subtitle: 'Edisi Bahasa Indonesia · 568 halaman PDF',
    description: 'Panduan LangGraph dalam Bahasa Indonesia, tersedia sebagai dokumen PDF lengkap.',
    coverColor: '#18253b', coverAccent: '#93c5fd', coverIcon: 'circuit',
  },
  {
    id: 'building-ai-agents-llms-rag-knowledge-graphs',
    fileName: '_OceanofPDF.com_Building_AI_Agents_with_LLMs_RAG_and_Knowledge_Graphs_A_practical_guide_to_autonomous_and_modern_AI_agents_-_Gabriele_Iuculano.pdf',
    title: 'Building AI Agents with LLMs, RAG and Knowledge Graphs', author: 'Salvatore Raieli & Gabriele Iuculano',
    category: 'Kecerdasan Buatan', subtitle: 'A Practical Guide to Autonomous and Modern AI Agents · 595 halaman PDF',
    description: 'Panduan praktis membangun agen AI dengan LLM, RAG, dan knowledge graph.',
    coverColor: '#2a1d32', coverAccent: '#d8b4fe', coverIcon: 'brain',
  },
  {
    id: 'mastering-unity-2d-game-development', fileName: 'vdoc.pub_mastering-unity-2d-game-development.epub',
    title: 'Mastering Unity 2D Game Development', author: 'Simon Jackson', category: 'Pengembangan Game',
    subtitle: 'EPUB lengkap', description: 'Buku pengembangan game 2D dengan Unity dalam format EPUB lengkap.',
    coverColor: '#202b22', coverAccent: '#bef264', coverIcon: 'zap',
  },
  {
    id: 'shadow-of-the-man-roger-penrose', fileName: 'Shadow of The man Rogeer Penrose.epub',
    title: 'Shadows of the Mind: A Search for the Missing Science of Consciousness', author: 'Roger Penrose', category: 'Sains & Filsafat',
    subtitle: 'EPUB lengkap', description: 'Buku Roger Penrose tentang pikiran, kesadaran, dan komputasi dalam format EPUB.',
    coverColor: '#2b201e', coverAccent: '#fdba74', coverIcon: 'sparkles',
  },
];

export const BOOKS_DATA: Book[] = entries.map(({ fileName, ...book }) => {
  const sourceUrl = documentUrls[`../../Dokumen/${fileName}`];
  if (!sourceUrl) throw new Error(`Dokumen katalog tidak ditemukan: ${fileName}`);
  return { ...book, sourceUrl, fileType: fileName.slice(fileName.lastIndexOf('.')).toLowerCase(), readTimeMinutes: 0, chapters: [] };
});

export const LEGACY_SAMPLE_BOOK_IDS = new Set([
  'competing-in-the-age-of-ai', '48-laws-of-power', 'prediction-machines',
  'a-world-without-work', 'the-book-of-wisdom', 'the-archetypes-and-collective-unconscious',
  'the-bomber-mafia', 'the-new-ceo', 'ai-superpowers', 'life-3-0',
]);

export const CATEGORIES = [
  { id: 'all', name: 'Semua Koleksi', count: BOOKS_DATA.length },
  { id: 'Kecerdasan Buatan', name: 'Kecerdasan Buatan', count: 3, icon: 'cpu', description: 'Agen AI, LangGraph, LLM, RAG, dan knowledge graph.' },
  { id: 'Pengembangan Game', name: 'Pengembangan Game', count: 1, icon: 'briefcase', description: 'Pengembangan game 2D dengan Unity.' },
  { id: 'Sains & Filsafat', name: 'Sains & Filsafat', count: 1, icon: 'brain', description: 'Pikiran, kesadaran, dan komputasi.' },
];
