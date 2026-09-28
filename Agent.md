# Agent.md — Context & Diagnosis Guide

Konteks project buat agent/AI yang bantu debug atau develop di sini. Baca ini dulu sebelum ubah kode.

## Apa ini

**F15 Library** — web app baca ringkasan buku 15 menit. React 19 + Vite + TypeScript, awalnya generated dari Google AI Studio. Fitur: reader dengan highlight/annotation, AI Mentor (Gemini), pomodoro timer, reading goal/streak tracker, badge/lencana, community shared highlights, export ke Google Workspace (Docs/Sheets/Gmail/Chat).

Nama app di UI: "F15 Library". Bahasa UI: Indonesia.

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4 (via `@tailwindcss/vite`), `lucide-react` icon, `motion` (framer-motion) animasi.
- **Backend runtime:** Express (`server.ts`) — cuma serve static build + satu API route (`/api/gemini/mentor`). Dev mode pakai Vite middleware plugin (`geminiApiPlugin` di `vite.config.ts`) buat route yang sama, jadi gak perlu jalanin `server.ts` terpisah saat dev.
- **AI:** `@google/genai`, model `gemini-3.1-pro-preview`, `ThinkingLevel.HIGH`. Panggilan cuma server-side (`src/server/gemini.ts`), gak pernah expose API key ke client.
- **Backend data:** Firebase — Auth (Google Sign-In, scope Docs/Sheets/Gmail/Chat buat export) + Firestore (cloud sync annotations/saved books/reading history/goals).
- **Parsing dokumen:** `mammoth` (docx), `pdfjs-dist` (pdf) — dipakai di `src/utils/documentParser.ts`, kemungkinan buat import buku sendiri.
- **Package manager:** pnpm (dipin di `package.json` → `packageManager`). Jangan pakai npm/yarn/bun — ada campur lockfile dulu, udah dibersihkan, jangan bikin lockfile lain lagi.

## Struktur

```
src/
  App.tsx              — root, state switch antar 4 view: home/collections/my-books/reader
  context/
    AuthContext.tsx     — SEMUA state app (auth, saved books, annotations, reading goal, sync). Baca ini dulu buat ngerti data flow.
    ThemeContext.tsx    — tema reader (dark/sepia/light/dst)
  components/           — UI components, satu file per fitur/view
  lib/
    firebase.ts          — init Firebase + semua fungsi Firestore CRUD/listener
    workspace.ts          — Google Workspace export logic
  server/
    gemini.ts            — panggilan Gemini API (server-only, pakai process.env.GEMINI_API_KEY)
  data/
    books.ts              — data buku HARDCODED (8810 baris gabungan components+data+utils). Belum ada CMS/backend buat buku.
    mockCommunityHighlights.ts
  utils/                 — badge logic, document parser, notification, reading goal calc
  types/index.ts          — semua interface/type app (Book, Annotation, SavedBook, ReadingGoal, dst)
server.ts                — express prod server
vite.config.ts           — vite config + gemini API middleware buat dev
firebase-applet-config.json — Firebase client config (apiKey publik, ini normal buat Firebase web)
firestore.rules           — security rules Firestore
metadata.json              — AI Studio app metadata
```

## Data flow penting

- **Semua state app** ada di `AuthContext` (bukan Redux/Zustand). Kalau nambah fitur yang butuh persist, ikutin pola yang ada: `useState` + `localStorage` sync via `useEffect`, plus fungsi `syncXToCloud`/`fetchXFromCloud`/`listenX` di `lib/firebase.ts` kalau perlu cloud sync.
- **Local-first, cloud-optional**: app jalan penuh tanpa login (localStorage). Login Google cuma buat sync cross-device + Workspace export. Jangan asumsikan `user` selalu ada.
- **Buku data statis** di `src/data/books.ts` — nambah/edit buku = edit file ini langsung, gak ada admin panel/CMS.
- **Gemini call**: client gak pernah panggil `@google/genai` langsung. Selalu lewat `POST /api/gemini/mentor` → `askGeminiMentor()`. Kalau `GEMINI_API_KEY` kosong, ada fallback simulasi (bukan error) — jadi app tetep kelihatan jalan meski API key belum diset, awas kalau diagnosis "AI Mentor kok jawabnya generik" → cek env var dulu.

## Env vars

Belum ada `.env.local` di repo ini (lihat `.env.example`):
- `GEMINI_API_KEY` — wajib buat AI Mentor asli (tanpa ini, fallback simulasi jalan diam-diam).
- `APP_URL` — dipakai AI Studio runtime, biasanya gak perlu di lokal.

## Command

```
pnpm install       # install deps
pnpm dev           # vite dev server, port 3000
pnpm build         # vite build → dist/
pnpm start         # jalanin server.ts (prod, serve dist/)
pnpm lint          # tsc --noEmit (gak ada eslint dikonfigurasi)
```

## Known gotcha (dari diagnosis sebelumnya)

- **pnpm build scripts**: `@firebase/util`, `@google/genai`, `esbuild`, `protobufjs` butuh `onlyBuiltDependencies` di `package.json` (`pnpm` key) biar postinstall script mereka jalan. Kalau lupa approve, install sukses tapi Firebase/esbuild bisa error runtime aneh.
- **Bukan git repo** (per pengecekan awal) — kalau mau commit history, `git init` dulu.
- **README.md** masih nyebut `npm install` — outdated, actual pakai pnpm.
- **Dua sumber Gemini config**: pastikan port/route API konsisten antara `vite.config.ts` (dev) dan `server.ts` (prod) kalau ubah endpoint — sekarang keduanya expose `/api/gemini/mentor`.

## Diagnosis checklist cepat

1. Error install/build script → cek `package.json` → `pnpm.onlyBuiltDependencies`.
2. AI Mentor jawab generik terus → cek `GEMINI_API_KEY` di env, bukan bug kode.
3. Data gak sync antar device → cek `firestore.rules` (owner-only per `userId`) dan `AuthContext.tsx` listener (`listenSavedBooks`/`listenAnnotations`/`listenReadingHistory`).
4. State UI aneh setelah login/logout → cek `AuthContext.tsx` bagian `initAuthListener`, ini yang handle merge local↔cloud saat auth berubah.
5. Reading goal/streak salah hitung → logic ada di `src/utils/readingGoalUtils.ts` (`computeGoalProgress`), bukan di component.
6. Badge gak unlock → `src/utils/badgeUtils.ts`.
