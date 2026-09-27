import { SharedHighlight } from '../types';

export const INITIAL_COMMUNITY_HIGHLIGHTS: SharedHighlight[] = [
  // Competing in The Age of AI
  {
    id: 'comm-competing-1',
    bookId: 'competing-in-the-age-of-ai',
    bookTitle: 'Competing in The Age of AI',
    chapterId: 'ch-1',
    chapterTitle: 'Bab 1: Pengemis di Era Digital',
    selectedText: 'Pabrik AI bukanlah bangunan fisik berisi server, melainkan arsitektur perangkat lunak yang secara konstan memproses data mentah, mengekstrak prediksi bernilai tinggi, dan mengotomatiskan keputusan operasional.',
    note: 'Definisi paling tajam tentang apa yang membedakan software biasa dengan organisasi bertenaga AI. Intinya adalah siklus keputusan otomatis.',
    color: 'yellow',
    userId: 'user-community-1',
    userDisplayName: 'Bagas Wicaksono',
    userPhotoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    isAnonymous: false,
    likesCount: 38,
    likedBy: ['demo-1', 'demo-2'],
    createdAt: '2026-09-18T08:30:00.000Z'
  },
  {
    id: 'comm-competing-2',
    bookId: 'competing-in-the-age-of-ai',
    bookTitle: 'Competing in The Age of AI',
    chapterId: 'ch-2',
    chapterTitle: 'Bab 2: Mesin Berbasis AI & Skala Tanpa Batas',
    selectedText: 'Skala tradisional dibatasi oleh kejenuhan manajerial. Skala berbasis algoritma diperkuat oleh hukum jaringan data.',
    note: 'Inilah alasan mengapa startup dengan 50 insinyur bisa mengalahkan bank korporat dengan ribuan staf.',
    color: 'green',
    userId: 'user-community-2',
    userDisplayName: 'Siti Rahmadani',
    userPhotoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    isAnonymous: false,
    likesCount: 29,
    likedBy: ['demo-3'],
    createdAt: '2026-09-19T14:15:00.000Z'
  },
  {
    id: 'comm-competing-3',
    bookId: 'competing-in-the-age-of-ai',
    bookTitle: 'Competing in The Age of AI',
    chapterId: 'ch-3',
    chapterTitle: 'Bab 3: Pelepasan Skala dan Lingkup (Scope & Scale)',
    selectedText: 'Cakupan bisnis tidak lagi ditentukan oleh lini perakitan, melainkan fleksibilitas repositori data.',
    note: 'Sangat relevan untuk strategi ekspansi vertikal produk digital kami.',
    color: 'blue',
    userId: 'user-community-3',
    userDisplayName: 'Pembaca Anonim',
    isAnonymous: true,
    likesCount: 17,
    likedBy: [],
    createdAt: '2026-09-20T10:00:00.000Z'
  },

  // AI Superpowers
  {
    id: 'comm-superpowers-1',
    bookId: 'ai-superpowers',
    bookTitle: 'AI Superpowers: China, Silicon Valley, and The New World Order',
    chapterId: 'ch-1',
    chapterTitle: 'Bab 1: Momen Sputnik Tiongkok',
    selectedText: 'Jika data adalah minyak baru, maka Tiongkok adalah Arab Saudi di era kecerdasan buatan.',
    note: 'Kutipan terkenal Kai-Fu Lee yang merangkum betapa krusialnya volume data riil di lapangan dibanding sekadar riset akademis murni.',
    color: 'yellow',
    userId: 'user-community-4',
    userDisplayName: 'Dimas Ardiansyah',
    userPhotoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    isAnonymous: false,
    likesCount: 45,
    likedBy: ['demo-1', 'demo-4'],
    createdAt: '2026-09-15T09:20:00.000Z'
  },
  {
    id: 'comm-superpowers-2',
    bookId: 'ai-superpowers',
    bookTitle: 'AI Superpowers: China, Silicon Valley, and The New World Order',
    chapterId: 'ch-2',
    chapterTitle: 'Bab 2: Gladiator Kewirausahaan',
    selectedText: 'Pemenang di era penerapan bukanlah penemu algoritma tercerdas, melainkan eksekutor lapangan yang paling tangguh dan cepat.',
    note: 'Pelajaran berharga untuk founder: inovasi teknologi hanya 20%, 80% sisanya adalah ketahanan eksekusi dan kecepatan iterasi.',
    color: 'orange',
    userId: 'user-community-5',
    userDisplayName: 'Nadia Paramita',
    userPhotoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    isAnonymous: false,
    likesCount: 33,
    likedBy: [],
    createdAt: '2026-09-17T11:45:00.000Z'
  },

  // Life 3.0
  {
    id: 'comm-life3-1',
    bookId: 'life-3-0',
    bookTitle: 'Life 3.0: Being Human in The Age of Artificial Intelligence',
    chapterId: 'ch-1',
    chapterTitle: 'Bab 1: Tiga Tahap Kehidupan',
    selectedText: 'Kehidupan 3.0 adalah kehidupan yang tidak hanya dapat memperbarui perangkat lunaknya (belajar), tetapi juga merancang ulang perangkat kerasnya sendiri.',
    note: 'Klasifikasi Max Tegmark ini membuka mata. Kita saat ini adalah Life 2.0 yang sedang menyaksikan kelahiran Life 3.0.',
    color: 'purple',
    userId: 'user-community-6',
    userDisplayName: 'Rian Pratama',
    isAnonymous: false,
    likesCount: 52,
    likedBy: ['demo-2'],
    createdAt: '2026-09-12T16:00:00.000Z'
  },

  // Atomic Habits
  {
    id: 'comm-atomic-1',
    bookId: 'atomic-habits',
    bookTitle: 'Atomic Habits',
    chapterId: 'ch-1',
    chapterTitle: 'Bab 1: Kekuatan Tak Terlihat Perubahan 1%',
    selectedText: 'Anda tidak naik ke tingkat tujuan Anda; Anda jatuh ke tingkat sistem Anda.',
    note: 'Kalimat paling transformatif dalam buku ini. Jangan hanya fokus pada target, tapi bangun kebiasaan harian yang menopangnya.',
    color: 'yellow',
    userId: 'user-community-7',
    userDisplayName: 'Maya Kusuma',
    userPhotoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    isAnonymous: false,
    likesCount: 64,
    likedBy: ['demo-1', 'demo-3', 'demo-5'],
    createdAt: '2026-09-10T12:00:00.000Z'
  }
];
