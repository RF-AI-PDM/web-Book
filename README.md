# F15 Library

Web app untuk membaca ringkasan buku dalam 15 menit — dengan reader (highlight & anotasi), AI Mentor bertenaga Gemini, pomodoro timer, reading goal & streak tracker, badge, shared highlights komunitas, serta export ke Google Workspace (Docs/Sheets/Gmail/Chat).

Dibangun dengan React 19 + Vite + TypeScript, awalnya digenerate dari Google AI Studio.

## Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS 4, `lucide-react`, `motion`
- **Backend runtime:** Express (`server.ts`) untuk production; dev server pakai middleware Vite
- **AI:** Google Gemini (`@google/genai`) — dipanggil hanya dari server, API key tidak pernah diekspos ke client
- **Data & Auth:** Firebase (Auth + Firestore) untuk sync antar perangkat
- **Parsing dokumen:** `mammoth` (docx), `pdfjs-dist` (pdf)

## Prasyarat

- Node.js
- pnpm (`npm install -g pnpm`)

## Menjalankan secara lokal

1. Install dependencies:

   ```sh
   pnpm install
   ```

2. Salin `.env.example` menjadi `.env.local`, lalu isi `GEMINI_API_KEY` dengan API key Gemini kamu. Tanpa key ini, AI Mentor akan berjalan dalam mode fallback simulasi.
3. Jalankan app dalam mode dev:

   ```sh
   pnpm dev
   ```

   App berjalan di `http://localhost:3000`.

## Script yang tersedia

| Command | Keterangan |
| --- | --- |
| `pnpm dev` | Vite dev server (port 3000) |
| `pnpm build` | Build production ke `dist/` |
| `pnpm start` | Jalankan `server.ts` (serve hasil build) |
| `pnpm preview` | Preview hasil build |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Jalankan test (Vitest) |
| `pnpm check` | typecheck + lint + test |

## Struktur proyek

Lihat [Agent.md](Agent.md) untuk penjelasan lebih detail tentang arsitektur, data flow, dan diagnosis checklist.
