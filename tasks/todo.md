# Task List: Reader PDF/EPUB Terstruktur

## Task 1: Definisikan schema konten v2 dan adapter kompatibilitas ✅

**Description:** Tambahkan model block/asset/diagnostics dan adapter agar chapter lama berbasis `string[]` tetap dapat dirender.

**Acceptance criteria:**
- [x] `ContentBlock`, `DocumentAsset`, diagnostics, dan schema version memiliki tipe eksplisit.
- [x] Chapter v1 dikonversi deterministik menjadi paragraph blocks tanpa mengubah data tersimpan.
- [x] ID block stabil dan unik dalam satu chapter.

**Verification:**
- [x] Unit test adapter dan type guards lulus.
- [x] `pnpm typecheck` lulus.

**Dependencies:** None

**Files likely touched:**
- `src/types/index.ts`
- `src/utils/documentContent.ts`
- `src/utils/documentContent.test.ts`

**Estimated scope:** Medium

## Task 2: Buat penyimpanan dan resolver aset lokal

**Description:** Simpan Blob gambar di IndexedDB dan resolve menjadi object URL yang lifecycle-nya aman.

**Acceptance criteria:**
- [x] Blob tetap tersedia pada instance IndexedDB baru (simulasi reload browser).
- [x] Record aset yang tersimpan tidak menyimpan object URL sementara/data URL.
- [x] Object URL di-revoke setelah tidak digunakan dan delete buku membersihkan asetnya.

**Verification:**
- [x] IndexedDB round-trip dan cleanup tests lulus.
- [ ] Manual reload/offline check menampilkan gambar (menunggu Task 3 menyimpan aset hasil parser dan Task 4 merender image block).

**Dependencies:** Task 1

**Files likely touched:**
- `src/lib/documentAssetStore.ts`
- `src/lib/documentAssetStore.test.ts`
- `src/types/index.ts`

**Estimated scope:** Medium

## Task 3: Parse EPUB menjadi block dan asset terstruktur

**Description:** Ubah traversal EPUB agar mengikuti spine, mempertahankan elemen semantic, dan mengekstrak image dengan relative path yang benar.

**Acceptance criteria:**
- [x] Heading, paragraph, list, quote, image, alt, dan caption muncul sesuai urutan spine.
- [x] Path gambar nested dan URL-encoded dapat di-resolve.
- [x] HTML/script/style asing tidak masuk ke output block.

**Verification:**
- [x] Fixture EPUB terstruktur lulus dalam unit/integration test.
- [x] Tidak ada duplicate paragraph dari nested container.

**Dependencies:** Tasks 1–2

**Files likely touched:**
- `src/utils/documentParser.ts`
- `src/utils/epubParser.ts`
- `src/utils/epubParser.test.ts`
- `src/test/fixtures/*`

**Estimated scope:** Medium

## Task 4: Render block dokumen di halaman Baca

**Description:** Tambahkan renderer semantik dan image component, lalu gunakan fallback adapter untuk buku lama.

**Acceptance criteria:**
- [x] Semua jenis block MVP memiliki semantic HTML dan tampilan theme-aware.
- [x] Gambar lazy-load, tidak overflow, memiliki placeholder/error/caption, dan lightbox.
- [x] Buku lama tetap terlihat dan dapat dinavigasi.

**Verification:**
- [x] Component tests untuk semua block dan fallback v1 lulus.
- [ ] Manual check mobile + enam tema Reader tidak menunjukkan overflow.

**Dependencies:** Tasks 1–3

**Files likely touched:**
- `src/components/DocumentBlockRenderer.tsx`
- `src/components/DocumentImage.tsx`
- `src/components/ReaderView.tsx`
- `src/index.css`

**Estimated scope:** Medium

## Checkpoint: EPUB end-to-end

- [ ] Upload → preview → save → reload → read berjalan dengan teks dan gambar.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test`, dan `pnpm build` lulus.
- [ ] Review manusia atas fidelity EPUB sebelum melanjutkan PDF.

## Task 5: Tambahkan preview dan diagnostics upload

**Description:** Perlihatkan contoh output block/aset serta warning kualitas sebelum pengguna menyimpan buku.

**Acceptance criteria:**
- [ ] Preview menampilkan heading, paragraf, dan thumbnail gambar pertama.
- [ ] UI menampilkan jumlah bab, halaman, gambar, halaman tanpa teks, dan warning.
- [ ] Parsing bisa dibatalkan atau diulang tanpa meninggalkan Blob yatim.

**Verification:**
- [ ] State idle/parsing/preview/error/cancel diuji.
- [ ] Manual check dokumen valid, kosong, rusak, dan terlalu besar.

**Dependencies:** Tasks 1–4

**Files likely touched:**
- `src/components/UploadBookModal.tsx`
- `src/components/DocumentPreview.tsx`
- `src/utils/documentParser.ts`
- `src/types/index.ts`

**Estimated scope:** Medium

## Task 6: Rekonstruksi layout teks PDF

**Description:** Kelompokkan item PDF.js berdasarkan koordinat menjadi baris, paragraf, heading, kolom, dan page break.

**Acceptance criteria:**
- [ ] PDF satu kolom mempertahankan paragraf dan heading dengan urutan benar.
- [ ] PDF dua kolom dibaca per kolom, bukan melompat horizontal antar kolom.
- [ ] Header/footer berulang dapat ditandai atau disaring dan scan-only terdeteksi.

**Verification:**
- [ ] Fixture satu kolom, dua kolom, rotated text, dan scan-only lulus.
- [ ] Diagnostics memberi warning ketika confidence rendah.

**Dependencies:** Task 1

**Files likely touched:**
- `src/utils/pdfParser.ts`
- `src/utils/pdfLayout.ts`
- `src/utils/pdfLayout.test.ts`
- `src/utils/documentParser.ts`
- `src/test/fixtures/*`

**Estimated scope:** Medium

## Task 7: Ekstrak visual PDF dengan fallback snapshot

**Description:** Ambil embedded image yang dapat dipetakan dan gunakan render page snapshot terkompresi bila ekstraksi tidak stabil.

**Acceptance criteria:**
- [ ] PDF berilustrasi menghasilkan minimal satu image block/asset pada posisi halaman yang benar.
- [ ] Fallback snapshot tidak menduplikasi teks sebagai teks kedua.
- [ ] Gambar di-resize/compress dan mempunyai batas ukuran/output yang jelas.

**Verification:**
- [ ] Fixture PDF image-only dan mixed text/image lulus.
- [ ] Manual memory check pada dokumen 100+ halaman tidak menunjukkan pertumbuhan tanpa batas.

**Dependencies:** Tasks 2 and 6

**Files likely touched:**
- `src/utils/pdfParser.ts`
- `src/utils/pdfVisualExtractor.ts`
- `src/utils/pdfVisualExtractor.test.ts`
- `src/lib/imageOptimization.ts`

**Estimated scope:** Medium

## Checkpoint: PDF end-to-end

- [ ] PDF teks dan gambar dapat diunggah, dipreview, disimpan, dan dibaca kembali.
- [ ] Mode/fallback visual dan warning scan-only sudah jelas.
- [ ] `pnpm check` dan `pnpm build` lulus.

## Task 8: Tambahkan sinkronisasi asset cloud dan perbaiki rules

**Description:** Integrasikan Firebase Storage untuk Blob, hydrate chapter v2, dan tambahkan rules owner/admin beserta cleanup.

**Acceptance criteria:**
- [ ] Buku pribadi hanya dapat dibaca/ditulis pemilik; katalog dapat dibaca sesuai kebijakan produk.
- [ ] Status UI membedakan local saved, uploading, synced, partial failure, dan retry.
- [ ] Menghapus buku membersihkan chapter dan aset tanpa orphan yang diketahui.

**Verification:**
- [ ] Firestore dan Storage emulator tests mencakup owner/non-owner/admin.
- [ ] Uji lintas perangkat berhasil memuat teks dan gambar.

**Dependencies:** Tasks 1–7

**Files likely touched:**
- `src/lib/firebase.ts`
- `src/lib/firebaseStorage.ts`
- `firestore.rules`
- `storage.rules`
- `src/context/AuthContext.tsx`

**Estimated scope:** Medium

## Task 9: Migrasikan persistence buku besar dari localStorage

**Description:** Simpan metadata/chapter buku unggahan di IndexedDB dan pertahankan localStorage hanya untuk indeks kecil/preferences.

**Acceptance criteria:**
- [ ] Buku lama dari localStorage diimpor sekali secara idempotent.
- [ ] Menyimpan buku besar tidak memblokir main thread secara nyata.
- [ ] Backup/export tetap memuat metadata dan menawarkan paket aset secara eksplisit.

**Verification:**
- [ ] Migration, quota error, dan recovery tests lulus.
- [ ] Manual check data lama tetap muncul setelah upgrade.

**Dependencies:** Tasks 1–2

**Files likely touched:**
- `src/context/AuthContext.tsx`
- `src/lib/documentBookStore.ts`
- `src/lib/documentBookStore.test.ts`
- `src/components/MyBooksView.tsx`

**Estimated scope:** Medium

## Task 10: Stabilkan anotasi pada structured blocks

**Description:** Simpan locator block/range untuk highlight baru sambil mempertahankan fallback quote selector anotasi lama.

**Acceptance criteria:**
- [ ] Highlight baru kembali ke teks yang sama setelah reload.
- [ ] Teks identik di dua paragraph tidak menyorot paragraph yang salah.
- [ ] Anotasi lama tetap terlihat atau ditandai untuk recovery bila ambigu.

**Verification:**
- [ ] Unit tests locator exact/prefix/suffix dan duplicate quote lulus.
- [ ] Manual check selection pada paragraph, quote, dan list item.

**Dependencies:** Tasks 1 and 4

**Files likely touched:**
- `src/types/index.ts`
- `src/utils/annotationLocator.ts`
- `src/utils/annotationLocator.test.ts`
- `src/components/DocumentBlockRenderer.tsx`
- `src/components/ReaderView.tsx`

**Estimated scope:** Medium

## Checkpoint: Siap rilis

- [ ] Semua acceptance criteria terpenuhi dan tidak ada regresi buku v1.
- [ ] Security emulator tests, `pnpm check`, dan `pnpm build` lulus.
- [ ] Uji manual desktop/mobile, online/offline, dan jaringan lambat selesai.
- [ ] Batas ukuran, privacy, dan retensi aset didokumentasikan.
- [ ] Human review menyetujui fidelity PDF/EPUB serta UX error state.
