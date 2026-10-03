# Perbaikan keandalan reader

## Penyimpanan dan migrasi

Buku unggahan dan katalog disimpan lengkap di IndexedDB. Data `f15_custom_books` dan `f15_catalog_books` dimigrasikan sekali; salinan localStorage dihapus hanya setelah seluruh buku berhasil disimpan. Kegagalan quota tidak memangkas paragraf dan tidak menampilkan buku sebagai berhasil disimpan.

Koleksi pribadi menggunakan scope per UID. Koleksi tanpa login menggunakan scope `personal:guest`. Data lama yang belum mempunyai identitas pemilik masuk ke koleksi tanpa login, sehingga tidak otomatis diunggah ke akun lain. Untuk memindahkannya, ekspor cadangan saat keluar akun, lalu login dan pulihkan cadangan tersebut.

Backup versi 2 membawa teks, anotasi, dan bytes gambar. Backup lama tanpa gambar tetap diterima untuk buku berbasis teks. Backup yang mengacu ke gambar tanpa bytes ditolak supaya hasil pemulihan tidak diam-diam kehilangan ilustrasi. Subscription dalam backup diabaikan. File backup maksimal 150 MB; file upload maksimal 100 MB.

## Cloud dan persiapan deployment

Konfigurasikan Firestore dan Firebase Storage pada proyek Firebase yang sama. `firebase.json` mengarah ke database Firestore default. Bila memakai `firestoreDatabaseId` khusus, sesuaikan target deployment dan gunakan custom claim admin untuk akses Storage.

Deploy rules ke proyek yang sudah diverifikasi:

```sh
firebase deploy --only firestore:rules,storage --project YOUR_PROJECT_ID
```

Pengunduhan gambar memakai `getBlob`, sehingga akses buku pribadi mengikuti Firebase Authentication tanpa download token publik. Bucket perlu konfigurasi CORS yang mengizinkan origin aplikasi untuk GET. Ikuti [panduan download Firebase Storage](https://firebase.google.com/docs/storage/web/download-files#cors_configuration); deployment rules tidak mengatur CORS bucket.

Gambar cloud yang didukung: PNG, JPEG, WebP, GIF, maksimal 20 MB per aset. Gambar diunduh ketika dibaca dan dicache untuk penggunaan offline. Kegagalan upload menandai sinkronisasi sebagai error, sedangkan buku lokal tetap tersedia; tombol sinkronisasi mengulang pengiriman buku pribadi. Hapus buku membersihkan aset dan chapter sebelum menghapus metadata. Chapter individual tetap harus memenuhi batas ukuran dokumen Firestore; buku lokal tidak dibatasi ukuran dokumen Firestore.

Admin frontend (`VITE_ADMIN_UIDS`) hanya mengatur tampilan kontrol. Otorisasi sebenarnya memakai custom claim `admin` atau dokumen `admins/{uid}` yang dibuat lewat lingkungan tepercaya. Pendaftaran admin di Firestore untuk Storage mengacu ke database default. Pengguna biasa tidak boleh menulis registry admin.

## VIP

Simulasi checkout, QRIS, nomor VA, dan tombol aktivasi dari browser dihapus. Status VIP dibaca dari akun yang sudah terverifikasi dan harus aktif serta belum kedaluwarsa. Pengguna tidak boleh membuat, mengubah, menghapus field subscription, atau menghapus dokumen pengguna yang memiliki subscription. Server Admin SDK atau admin tepercaya mengelola entitlement.

Integrasi payment gateway dan webhook belum tersedia. Audit subscription lama yang berasal dari simulasi sebelum menjalankan pembayaran sungguhan; rules baru tidak otomatis mengubah data lama. Gate premium di frontend merupakan kontrol UI, bukan perlindungan distribusi file katalog publik. Konten berbayar sungguhan membutuhkan delivery yang diverifikasi server.

## PDF dan highlight

PDF direkonstruksi dari koordinat menjadi baris, paragraf, heading, dan urutan dua kolom. Parser memberi warning untuk teks berotasi dan halaman tanpa teks. PDF maksimal 500 halaman; scan membutuhkan OCR. Ilustrasi, tabel, header/footer berulang, serta layout kompleks belum direkonstruksi penuh, dan preview menjelaskan keterbatasan ini.

Highlight baru menyimpan ID block/item, offset, prefix, dan suffix. Highlight lama hanya dirender bila kutipannya unik dalam chapter; anotasi ambigu tetap tersedia di jurnal untuk recovery. Pilihan highlight saat ini dibatasi ke satu paragraph, heading, quote, atau list item. Jumlah buku selesai memakai ID buku untuk menghindari penghitungan berulang, termasuk setelah reload.

## Verifikasi

```sh
corepack pnpm check
corepack pnpm build
corepack pnpm dlx firebase-tools@15.32.1 emulators:exec --only firestore,storage --project demo-f15 "node --test tests/security/firebase.rules.test.mjs"
```

Emulator membutuhkan Java 21. Pengujian rules mencakup owner/non-owner/guest, admin claim/registry, entitlement, ukuran gambar, dan cleanup. CI menjalankan pemeriksaan aplikasi, build, dan rules emulator dengan konfigurasi Firebase demo.

Untuk browser, buat fixture dengan `node scripts/create-reader-fixture.mjs`, lalu unggah `artifacts/reader-verification/reader-smoke.epub`. Verifikasi preview → save → read → highlight paragraph kedua → reload → buka lagi. Teks paragraph ketiga, gambar, dan highlight harus tetap utuh; hitungan selesai tetap satu.
