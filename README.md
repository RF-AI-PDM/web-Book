# F15 Library
<div align="center">

Web app untuk membaca ringkasan buku dalam 15 menit — dengan reader (highlight & anotasi), AI Mentor bertenaga Gemini, pomodoro timer, reading goal & streak tracker, badge, shared highlights komunitas, serta export ke Google Workspace (Docs/Sheets/Gmail/Chat).
# 📚 Evolusi Book

Dibangun dengan React 19 + Vite + TypeScript, awalnya digenerate dari Google AI Studio.
**Platform membaca buku digital modern — Baca. Tumbuh. Berevolusi.**

## Stack
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, `lucide-react`, `motion`
- **Backend runtime:** Express (`server.ts`) untuk production; dev server pakai middleware Vite
- **AI:** Google Gemini (`@google/genai`) — dipanggil hanya dari server, API key tidak pernah diekspos ke client
- **Data & Auth:** Firebase (Auth + Firestore) untuk sync antar perangkat
- **Parsing dokumen:** `mammoth` (docx), `pdfjs-dist` (pdf)
</div>

## Prasyarat
---

- Node.js
- pnpm (`npm install -g pnpm`)
## 📖 Tentang Proyek

## Menjalankan secara lokal
**Evolusi Book** adalah aplikasi web baca buku digital yang dirancang untuk mendorong kebiasaan membaca yang konsisten. Pengguna dapat membaca ringkasan buku-buku terlaris, membuat anotasi pribadi, melacak progres harian, serta mensinkronisasi data antar perangkat melalui cloud.

1. Install dependencies:
Dibangun dengan arsitektur **local-first** — aplikasi berjalan penuh tanpa koneksi internet, dengan sinkronisasi cloud opsional menggunakan Firebase.

   ```sh
   pnpm install
   ```
---

2. Salin `.env.example` menjadi `.env.local`, lalu isi `GEMINI_API_KEY` dengan API key Gemini kamu. Tanpa key ini, AI Mentor akan berjalan dalam mode fallback simulasi.
3. Jalankan app dalam mode dev:
## ✨ Fitur Utama

   ```sh
   pnpm dev
   ```
| Kategori | Fitur |
|----------|-------|
| 📖 **Reader** | Baca buku dengan highlight, anotasi warna-warni, dan progress tracker per bab |
| 🤖 **AI Mentor** | Asisten pemikiran cerdas bertenaga Google Gemini Pro (Thinking Mode) |
| 🎯 **Reading Goal** | Target membaca harian/mingguan, streak tracker, dan lencana prestasi |
| ⏱️ **Pomodoro Timer** | Timer baca terfokus terintegrasi langsung di reader |
| ☁️ **Cloud Sync** | Sinkronisasi real-time antar perangkat via Firebase Firestore |
| 🌍 **Community** | Shared highlights — bagikan kutipan favorit ke komunitas pembaca |
| 📤 **Workspace Export** | Export anotasi ke Google Docs, Sheets, Gmail, dan Chat |
| 📁 **Upload Buku** | Import buku pribadi dalam format PDF, DOCX, dan EPUB |
| 🌓 **Dark / Light Mode** | Toggle tema gelap/terang dengan transisi halus, persisten di localStorage |
| 📱 **PWA Ready** | Installable sebagai Progressive Web App, support offline mode |

   App berjalan di `http://localhost:3000`.
---

## Script yang tersedia
## 🏗️ Arsitektur & Tech Stack

| Command | Keterangan |
| --- | --- |
| `pnpm dev` | Vite dev server (port 3000) |
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React SPA)                    │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  AuthContext │  │ ThemeContext  │  │  Components  │  │
│  │  (App State) │  │ (UI Theme)   │  │  (UI Layer)  │  │
│  └──────┬───────┘  └──────────────┘  └──────────────┘  │
│         │                                               │
│  ┌──────▼───────────────────────────────────┐           │
│  │            lib/firebase.ts               │           │
│  │  Auth · Firestore CRUD · Real-time Sync  │           │
│  └──────────────────────────────────────────┘           │
└────────────────────┬────────────────────────────────────┘
                     │ POST /api/gemini/mentor
┌────────────────────▼────────────────────────────────────┐
│               SERVER (Express / Vite Plugin)             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  src/server/gemini.ts  ←  GEMINI_API_KEY (env)  │   │
│  │  Google Gemini Pro — server-only, key not leaked │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    FIREBASE CLOUD                        │
│  Auth (Google OAuth)  ·  Firestore  ·  Security Rules   │
└─────────────────────────────────────────────────────────┘
```

### Stack Teknologi

| Layer | Teknologi |
|-------|-----------|
| **UI Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Language** | TypeScript 7 |
| **Styling** | Tailwind CSS 4 |
| **Icons** | Lucide React |
| **Animation** | Motion (Framer Motion) |
| **Backend Runtime** | Express.js (`server.ts`) |
| **AI** | Google Gemini Pro via `@google/genai` |
| **Auth & Database** | Firebase (Auth + Firestore) |
| **Document Parsing** | Mammoth (DOCX), PDF.js (PDF) |
| **Testing** | Vitest |
| **Package Manager** | pnpm |

---

## 📁 Struktur Proyek

```
evolusi-book/
├── src/
│   ├── App.tsx                   # Root — routing 4 view (home/collections/my-books/reader)
│   ├── main.tsx                  # Entry point React
│   ├── index.css                 # Global styles & theme CSS variables
│   │
│   ├── context/
│   │   ├── AuthContext.tsx       # ⭐ App state utama (auth, books, annotations, goals, sync)
│   │   └── ThemeContext.tsx      # UI theme (dark/light/sepia) & reader preferences
│   │
│   ├── components/               # UI components per fitur/view
│   │   ├── Navbar.tsx            # Top navigation + search + theme toggle
│   │   ├── HeroSection.tsx       # Landing hero
│   │   ├── ReaderView.tsx        # Digital book reader + highlighting
│   │   ├── AIMentorModal.tsx     # AI Gemini thinking mentor
│   │   ├── MyBooksView.tsx       # User library, journal, goals
│   │   ├── SettingsModal.tsx     # Theme, font, account settings
│   │   ├── SubscriptionModal.tsx # VIP upgrade flow
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── firebase.ts           # Firebase init + semua Firestore CRUD & listeners
│   │   └── workspace.ts          # Google Workspace export (Docs/Sheets/Gmail/Chat)
│   │
│   ├── server/
│   │   ├── gemini.ts             # Gemini API handler — server-only, API key tidak ke client
│   │   ├── rateLimit.ts          # Rate limiting middleware
│   │   └── validateMentorRequest.ts
│   │
│   ├── data/
│   │   ├── books.ts              # Katalog buku (hardcoded, editable via Admin CMS)
│   │   └── mockCommunityHighlights.ts
│   │
│   ├── utils/
│   │   ├── readingGoalUtils.ts   # Kalkulasi streak, progress, goal summary
│   │   ├── badgeUtils.ts         # Logika unlock lencana prestasi
│   │   ├── documentParser.ts     # Parser PDF & DOCX untuk upload buku
│   │   └── notificationUtils.ts  # Push notification & reminder logic
│   │
│   └── types/index.ts            # Semua TypeScript interfaces & types
│
├── server.ts                     # Express production server
├── vite.config.ts                # Vite config + Gemini API dev middleware
├── firebase-blueprint.json       # Firebase project blueprint (tidak berisi secrets)
├── firestore.rules               # Firestore security rules
├── .env.example                  # Template environment variables
└── package.json
```

---

## 🚀 Memulai (Quick Start)

### Prasyarat

- **Node.js** ≥ 18
- **pnpm** — `npm install -g pnpm`
- Akun **Firebase** (untuk Auth + Firestore)
- **Gemini API Key** (opsional — AI Mentor berjalan dalam mode fallback tanpa ini)

### 1. Clone & Install

```bash
git clone https://github.com/RF-AI-PDM/web-Book.git
cd web-Book
pnpm install
```

### 2. Konfigurasi Environment

Salin file contoh dan isi variabel yang dibutuhkan:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Wajib untuk AI Mentor (tanpa ini, mode fallback simulasi aktif)
GEMINI_API_KEY=your_gemini_api_key_here

# Opsional — dipakai AI Studio runtime
APP_URL=http://localhost:3000
```

### 3. Konfigurasi Firebase

Buat file `firebase-applet-config.json` di root proyek (lihat `firebase-blueprint.json` sebagai template):

```json
{
  "projectId": "your-project-id",
  "appId": "your-app-id",
  "apiKey": "your-firebase-api-key",
  "authDomain": "your-project.firebaseapp.com",
  "storageBucket": "your-project.firebasestorage.app",
  "messagingSenderId": "your-sender-id"
}
```

> ⚠️ File ini **tidak di-commit** ke git (ada di `.gitignore`) karena berisi API key.

### 4. Jalankan Development Server

```bash
pnpm dev
```

Aplikasi berjalan di **[http://localhost:3000](http://localhost:3000)**

---

## 🔧 Perintah yang Tersedia

| Perintah | Keterangan |
|----------|-----------|
| `pnpm dev` | Vite dev server (port 3000) dengan HMR |
| `pnpm build` | Build production ke `dist/` |
| `pnpm start` | Jalankan `server.ts` (serve hasil build) |
| `pnpm preview` | Preview hasil build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Jalankan test (Vitest) |
| `pnpm check` | typecheck + lint + test |
| `pnpm start` | Jalankan Express server untuk production |
| `pnpm preview` | Preview hasil build production |
| `pnpm typecheck` | Cek tipe TypeScript (`tsc --noEmit`) |
| `pnpm lint` | Jalankan ESLint |
| `pnpm test` | Jalankan unit test (Vitest) |
| `pnpm check` | Jalankan typecheck + lint + test sekaligus |

## Struktur proyek
---

Lihat [Agent.md](Agent.md) untuk penjelasan lebih detail tentang arsitektur, data flow, dan diagnosis checklist.
## 🔒 Keamanan

- **API Key Gemini** tidak pernah diekspos ke client — selalu dipanggil server-side
- **Firebase API Key** bersifat publik (desain Firebase), dilindungi oleh **Firestore Security Rules** (`firestore.rules`)
- **Data pengguna** hanya dapat diakses oleh pemiliknya sendiri (owner-only rules per `userId`)
- **VIP/Subscription state** disimpan di Firestore (bukan localStorage) untuk mencegah manipulasi client-side

---

## 🗂️ Data Flow

```
User Action
    │
    ▼
Component (UI)
    │
    ▼
AuthContext (App State)
    │
    ├── localStorage (offline, instant)
    │
    └── Firebase Firestore (cloud sync, real-time)
              │
              └── Real-time Listeners → update UI otomatis
```

- **Local-first**: App berjalan penuh tanpa login menggunakan `localStorage`
- **Cloud-optional**: Login Google mengaktifkan sync Firestore real-time antar perangkat
- **Merge strategy**: Saat login pertama, data cloud di-merge dengan data lokal

---

## ⚙️ Firebase Setup

### 1. Aktifkan Google Sign-In

Firebase Console → **Authentication** → **Sign-in Method** → Aktifkan **Google**

### 2. Tambahkan Authorized Domain

Firebase Console → **Authentication** → **Settings** → **Authorized domains**

Tambahkan:
- `localhost`
- Domain production kamu (jika sudah deploy)

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `AI Mentor` jawab generik | Cek `GEMINI_API_KEY` di `.env.local` — tanpa key, fallback simulasi aktif |
| Google Sign-In gagal (popup blocked) | Izinkan popup di browser untuk `localhost:3000` |
| Google Sign-In gagal (unauthorized domain) | Tambahkan domain di Firebase Console → Auth → Authorized domains |
| Data tidak sync antar perangkat | Cek `firestore.rules` dan pastikan user sudah login |
| Build error `esbuild` | Jalankan `npm install-scripts approve esbuild` |
| State aneh setelah login/logout | Periksa `AuthContext.tsx` → fungsi `initAuthListener` |
| Reading streak salah | Logic ada di `src/utils/readingGoalUtils.ts` → `computeGoalProgress()` |
| Badge tidak unlock | Periksa `src/utils/badgeUtils.ts` |

---

## 🤝 Kontribusi

1. Fork repository ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m "feat: deskripsi singkat"`
4. Push branch: `git push origin feat/nama-fitur`
5. Buat Pull Request

### Konvensi Commit

```
feat:     Fitur baru
fix:      Perbaikan bug
refactor: Refactoring kode
docs:     Perubahan dokumentasi
style:    Perubahan styling/UI
test:     Menambah atau memperbaiki test
chore:    Pemeliharaan (update deps, config, dll)
```

---

## 📄 Lisensi

Didistribusikan di bawah **MIT License**. Lihat [`LICENSE`](LICENSE) untuk informasi lebih lanjut.

---

<div align="center">

Dibuat dengan ❤️ oleh **RF-AI-PDM Team**

[🌐 Live Demo](https://github.com/RF-AI-PDM/web-Book) · [🐛 Report Bug](https://github.com/RF-AI-PDM/web-Book/issues) · [✨ Request Feature](https://github.com/RF-AI-PDM/web-Book/issues)

</div>
