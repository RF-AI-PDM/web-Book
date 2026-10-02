# Rencana Implementasi: Reader PDF/EPUB dengan Gambar dan Tata Letak Terstruktur

## Ringkasan

Tujuan perubahan ini adalah membuat dokumen PDF/EPUB yang diunggah tampil di halaman **Baca** dengan gambar, urutan baca, paragraf, heading, daftar, kutipan, dan pemisah halaman yang lebih mendekati dokumen sumber. Implementasi memakai model konten blok terstruktur yang kompatibel dengan data lama, penyimpanan aset terpisah dari Firestore, parser khusus per format, dan renderer Reader yang aman serta responsif.

## Kondisi Saat Ini

- `Chapter.content` hanya `string[]`, sehingga semua elemen dianggap paragraf biasa.
- Parser PDF menggabungkan `TextItem.str` memakai spasi; koordinat, baris, kolom, ukuran font, dan gambar hilang.
- Parser EPUB mengambil `textContent` dari beberapa elemen; struktur XHTML, list, heading, caption, dan `<img>` hilang.
- Reader selalu merender konten sebagai `<p>`, sehingga hierarki dan layout dokumen tidak mungkin dipertahankan.
- Buku lengkap disimpan ke `localStorage`; gambar dalam bentuk data URL akan cepat melewati quota browser.
- Sinkronisasi chapter sudah memakai subcollection Firestore, tetapi rules saat ini belum memberi akses untuk `customBooks`, `catalog`, atau chapter turunannya.
- Belum ada Firebase Storage atau aturan akses aset.

## Target Pengalaman Pengguna

1. Pengguna mengunggah PDF/EPUB dan melihat progres pemrosesan per tahap.
2. Sebelum menyimpan, pengguna melihat preview teks, gambar, jumlah bab/halaman, dan peringatan jika ekstraksi kurang baik.
3. Halaman Baca menampilkan heading, paragraf, list, quote, gambar/caption, dan page break secara konsisten.
4. Gambar di-load secara lazy, tidak membuat halaman melebar, dan dapat dibuka dalam lightbox.
5. Buku lama berbasis `string[]` tetap dapat dibaca tanpa migrasi wajib.
6. Dokumen lokal tetap dapat dibaca offline; ketika login, metadata dan aset dapat disinkronkan sesuai hak akses.

## Keputusan Arsitektur

### 1. Model konten blok, bukan HTML mentah

Tambahkan tipe `ContentBlock` berupa discriminated union, misalnya:

```ts
type ContentBlock =
  | { id: string; type: 'heading'; level: 1 | 2 | 3; text: string }
  | { id: string; type: 'paragraph'; text: string; align?: 'left' | 'center' | 'right' | 'justify' }
  | { id: string; type: 'list'; ordered: boolean; items: string[] }
  | { id: string; type: 'quote'; text: string; attribution?: string }
  | { id: string; type: 'image'; assetId: string; alt: string; caption?: string; width?: number; height?: number }
  | { id: string; type: 'pageBreak'; pageNumber?: number };
```

`Chapter.blocks?: ContentBlock[]` ditambahkan sementara `Chapter.content: string[]` dipertahankan sebagai fallback. Renderer memilih `blocks` jika ada, lalu jatuh kembali ke `content`. Hindari menyimpan XHTML/HTML mentah untuk mengurangi risiko XSS dan ketergantungan pada CSS penerbit.

### 2. Pisahkan aset binary dari metadata

- Metadata buku, chapter, block, dan referensi `assetId` tetap di Firestore.
- Binary gambar lokal disimpan di IndexedDB sebagai `Blob`, bukan `localStorage`.
- Binary gambar tersinkron disimpan di Firebase Storage dengan path pemilik, misalnya `users/{uid}/books/{bookId}/assets/{assetId}`.
- URL unduhan tidak disimpan permanen di block; resolver membuat object URL lokal atau mengambil download URL ketika diperlukan.
- Object URL di-revoke ketika komponen unmount dan gambar memakai lazy loading.

Untuk katalog publik, gunakan namespace terpisah `catalog/{bookId}/assets/{assetId}` dan hanya admin yang dapat menulis.

### 3. Parser berbasis format

**EPUB:** baca OPF manifest + spine, normalisasi relative path, traverse DOM sesuai urutan, konversi elemen semantic menjadi block, ekstrak image/cover dari ZIP sebagai Blob, dan pertahankan caption/alt. CSS penerbit tidak dieksekusi; hanya metadata presentasi yang aman yang dipetakan.

**PDF:** gunakan koordinat transform PDF.js untuk mengelompokkan glyph menjadi baris dan paragraf, mendeteksi heading dari ukuran font, serta menyimpan page break. Ekstraksi image dari PDF.js lebih rapuh antar PDF, jadi gunakan pipeline dua tingkat:

- Prioritas: ekstrak embedded raster image bila operator list dapat dipetakan dengan stabil.
- Fallback MVP: render halaman yang mengandung visual menjadi image snapshot terkompresi, lalu letakkan sebagai figure/page visual. Teks tetap menjadi selectable text block.

Multi-column PDF harus diurutkan berdasarkan cluster kolom sebelum top-to-bottom. PDF scan tanpa text layer ditandai sebagai membutuhkan OCR; OCR tidak termasuk MVP pertama.

### 4. Renderer deklaratif dan aman

Buat `DocumentBlockRenderer` dan subkomponen per tipe block. Semua teks dirender sebagai React text node. Gambar memakai `DocumentImage` dengan placeholder, error state, caption, lazy loading, ukuran maksimum, dan lightbox. Highlight/anotasi tahap pertama diterapkan pada block teks menggunakan `blockId` + quote selector; fallback anotasi lama berbasis `selectedText` tetap didukung.

### 5. Versioning dan kompatibilitas

Tambahkan `documentSchemaVersion: 2` pada buku unggahan baru. Reader mendukung:

- v1: `content: string[]` (data lama)
- v2: `blocks: ContentBlock[]` + asset references

Tidak perlu migrasi massal. Buku v1 dapat diubah ke paragraph blocks saat dibaca atau disimpan ulang.

## Alur Data

```text
File PDF/EPUB
  -> validasi ukuran/MIME/signature
  -> parser per format
  -> ParsedDocument { chapters.blocks, assets, diagnostics }
  -> preview & quality warning
  -> simpan metadata/chapter
     -> local: IndexedDB (book + asset Blob)
     -> signed-in: Firestore (metadata) + Firebase Storage (asset)
  -> Reader memuat chapter on-demand
  -> asset resolver memilih local Blob atau cloud URL
  -> DocumentBlockRenderer
```

## Tahapan Implementasi

### Fase 1 — Kontrak data dan kompatibilitas

Definisikan `ContentBlock`, `DocumentAsset`, `ExtractionDiagnostics`, dan schema version. Tambahkan adapter v1 `string[]` ke paragraph blocks. Ini menjadi kontrak bersama parser, persistence, dan UI.

### Fase 2 — EPUB end-to-end

Implementasikan ekstraksi EPUB terstruktur terlebih dahulu karena XHTML memiliki struktur dan relasi gambar yang eksplisit. Selesaikan satu jalur penuh: parse → preview → IndexedDB/Storage → Reader. Ini membuktikan kontrak sebelum menangani PDF yang lebih heuristik.

### Fase 3 — PDF layout-aware

Ganti join-spasi dengan rekonstruksi baris/paragraf berbasis koordinat, heading heuristic, deteksi kolom, page break, dan pipeline visual dengan fallback page snapshot. Tambahkan quality score agar pengguna tahu jika urutan baca diragukan.

### Fase 4 — Anotasi, performa, dan sinkronisasi

Perbarui locator anotasi agar stabil terhadap block, batasi concurrency upload, resize/compress gambar, muat chapter/aset on-demand, serta perbaiki rules Firestore/Storage.

### Fase 5 — UX polish dan aksesibilitas

Tambahkan preview hasil ekstraksi, lightbox, alt text fallback, status offline/sync, error per aset, dan pilihan mode tampilan “Reflow” versus “Halaman asli” untuk PDF.

## Checkpoint

### Setelah Fase 1–2

- EPUB berisi heading, list, quote, dan gambar tampil end-to-end.
- Buku lama tetap tampil sama.
- Reload browser tidak menghilangkan aset lokal.
- Typecheck, lint, unit test, dan build lulus.

### Setelah Fase 3

- Fixture PDF satu kolom dan dua kolom memiliki urutan baca yang benar.
- Gambar/visual PDF muncul melalui embedded extraction atau fallback snapshot.
- Scan-only PDF menampilkan pesan OCR yang jelas, bukan buku kosong.

### Setelah Fase 4–5

- Highlight tetap dapat dibuka setelah reload dan pergantian perangkat.
- Rules menolak akses aset pribadi milik pengguna lain.
- Reader mobile tidak overflow dan gambar tidak menyebabkan layout shift besar.
- Buku besar tidak memblokir UI dan tidak memenuhi `localStorage`.

## Strategi Pengujian

- Unit: normalisasi path EPUB, DOM-to-block, PDF line grouping, column ordering, adapter v1, sanitasi metadata, dan diagnostics.
- Fixture integration: EPUB dengan nested path/SVG/JPEG/caption; PDF satu kolom, dua kolom, gambar, dan scan-only.
- Component: setiap block, image loading/error, fallback v1, dan annotation locator.
- Persistence: IndexedDB round-trip Blob; Firestore chapter hydration; upload/download/delete asset.
- Security: emulator rules untuk owner/non-owner/admin dan batas metadata.
- Manual: desktop/mobile, dark/light/sepia, offline reload, dokumen 100+ halaman, serta koneksi lambat.
- Per checkpoint jalankan `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm build`.

## Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| PDF tidak memiliki struktur semantik baku | Urutan teks dapat salah | Heuristik koordinat + fixture beragam + quality warning + mode halaman asli |
| PDF hasil scan tidak punya text layer | Teks tak bisa dicari/highlight | Deteksi dini dan pesan OCR; tambah OCR sebagai fase terpisah |
| Asset membuat storage/quota besar | Upload gagal atau mahal | Resize/compress, batas jumlah/ukuran, dedup hash, upload on-demand |
| Data URL membengkakkan Firestore/localStorage | Quota dan limit dokumen terlampaui | Simpan Blob di IndexedDB/Firebase Storage, hanya `assetId` di block |
| URL lokal tidak valid setelah reload | Gambar hilang | Simpan Blob persistent dan buat ulang object URL melalui resolver |
| Highlight berbasis string ambigu | Highlight pindah/salah | Locator `blockId + start/end + exact quote`, fallback ke data lama |
| XHTML/CSS EPUB berbahaya | XSS atau style leakage | Parse menjadi allowlisted blocks; jangan render HTML/CSS penerbit |
| Rules saat ini tidak mencakup koleksi buku | Sync gagal atau aturan tidak aman | Tambahkan Firestore/Storage rules dan emulator tests sebelum rilis |

## Rekomendasi Fitur yang Perlu Diperbaiki

Urutan berikut berdasarkan dampak dan ketergantungan:

1. **P0 — Perbaiki security rules dan error propagation.** Operasi sync saat ini berpotensi gagal karena rules tidak mencakup custom book/catalog; UI juga perlu membedakan tersimpan lokal versus benar-benar tersinkron.
2. **P0 — Preview dan diagnostics ekstraksi.** Tampilkan thumbnail/preview beberapa block, jumlah gambar, halaman tanpa teks, skor kualitas, serta opsi batal sebelum save.
3. **P0 — Storage lokal yang tepat.** Pindahkan buku unggahan besar dari `localStorage` ke IndexedDB agar tidak mudah terkena quota dan freeze saat serialisasi.
4. **P1 — Mode PDF “Reflow / Halaman Asli”.** Reflow optimal untuk baca dan highlight; halaman asli menjaga fidelity layout tabel/diagram.
5. **P1 — OCR opsional untuk scan.** Jalankan di worker/server, tampilkan estimasi biaya/waktu, dan izinkan hanya halaman tertentu.
6. **P1 — Pencarian dalam buku dan navigasi halaman.** Indeks per block, hasil pencarian menuju block/page, dan keyboard shortcut.
7. **P1 — Anotasi yang stabil.** Gunakan block/range locator, dukung highlight lintas inline span, dan tampilkan orphaned annotation recovery.
8. **P1 — Manajemen upload.** Progress per tahap, cancel/retry, validasi ukuran, dedup file hash, serta cleanup aset saat buku dihapus.
9. **P2 — Daftar isi hasil ekstraksi yang bisa diedit.** Pengguna dapat menggabungkan/memisahkan bab dan memperbaiki judul sebelum menyimpan.
10. **P2 — Aksesibilitas gambar.** Alt text dari EPUB, caption otomatis sebagai fallback, zoom keyboard, dan screen-reader labels.
11. **P2 — Virtualization untuk buku besar.** Render window per block/page agar Reader tetap responsif untuk ratusan halaman.
12. **P2 — Observability.** Catat durasi parse, kegagalan per format, jumlah fallback snapshot, dan error sinkronisasi tanpa menyimpan isi buku pengguna.

## Batas MVP yang Disarankan

MVP sebaiknya mencakup EPUB terstruktur penuh, PDF text layout satu/dua kolom, page break, visual fallback, IndexedDB lokal, Firebase Storage untuk user login, preview diagnostics, dan renderer block. OCR, tabel kompleks, persamaan matematika, CSS EPUB penuh, serta pixel-perfect PDF ditunda. Janji produk yang realistis adalah **“tampilan terstruktur dan mendekati dokumen sumber”**, bukan identik 100% untuk semua PDF.

## Pertanyaan Produk Sebelum Implementasi

- Apakah fidelity PDF lebih penting daripada kemampuan resize/reflow? Rekomendasi: sediakan dua mode dan jadikan Reflow default.
- Berapa batas file, jumlah gambar, dan storage per pengguna sesuai tier? Rekomendasi awal: 50 MB/file dan gambar hasil optimasi maksimal 1600 px.
- Apakah buku pribadi harus tersinkron lintas perangkat atau cukup lokal? Rencana ini mendukung keduanya, tetapi cloud asset membutuhkan Firebase Storage dan aturan billing/quota.
- Apakah OCR wajib di rilis pertama? Rekomendasi: deteksi + pesan dahulu, OCR menjadi fase berikutnya.
