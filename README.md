# Posyandu Wapalo

Sistem informasi posyandu digital: **kalkulator status gizi anak** berbasis standar pertumbuhan
WHO (metode LMS, port TypeScript dari kalkulator Python) + **pencatatan kunjungan** multi-sasaran
(Balita, Bumil/Busui, dan Apras) dengan rekap resmi bulanan/tahunan serta ekspor Excel/CSV/PDF.

- Bahasa & UI: **Indonesia**
- Arsitektur: SPA Vite + Vue 3 + TypeScript, seluruh perhitungan **client-side**; backend **Supabase** (PostgreSQL + Auth + RLS ketat)
- Offline: PWA instalabel (`vite-plugin-pwa`); pencatatan kunjungan tetap bisa diantrekan lalu disinkronkan otomatis

## Fitur

- Kalkulator z-score WHO (BB/U, TB/U, BB/TB, LiKA, LiLA) dengan kurva interaktif — mengikuti klasifikasi resmi (mis. Gizi Buruk/Kurang/Baik, Stunting, Obesitas)
- CRUD Balita, Bumil/Busui, dan Apras lengkap dengan riwayat kunjungan
- Rekap Bulanan Posyandu (format resmi) & Rekap Tahunan Bumil/Busui — Excel, CSV, dan Cetak/PDF
- Dashboard & seksi statistik bulan berjalan (hanya agregat, privasi aman)
- Peran admin vs kader read-only (RLS `is_admin()` + gating UI)
- PWA offline: app shell ter-precache, antrean kunjungan FIFO di `localStorage`

## Tech Stack

| Lapisan | Teknologi |
|---|---|
| Frontend | Vue 3 + TypeScript + Vite, Vue Router (lazy routes) |
| UI | shadcn-vue + Tailwind CSS v4, ikon `@lucide/vue`, font IBM Plex Sans |
| Perhitungan | TS port kalkulator Python (LMS WHO) di `src/lib/kalkulator/` |
| Ekspor | SheetJS `xlsx` (impor dinamis — chunk terpisah) |
| Backend | Supabase (PostgreSQL + Auth/RLS), migrasi di `supabase/migrations/` |
| Test/Lint | Vitest, ESLint 9 flat config |

> Tanpa konfigurasi Supabase, aplikasi tetap jalan untuk **landing, dashboard publik, dan kalkulator**
> (seksi statistik disembunyikan); pencatatan data butuh klien Supabase.

## Memulai

Prasyarat: Node.js (versi yang didukung Vite 8).

```bash
npm install
```

Salin templat lingkungan lalu isi kredensial proyek Supabase:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=        # URL proyek (https://<ref>.supabase.co)
VITE_SUPABASE_ANON_KEY=   # anon/public key
VITE_APP_URL=             # opsional: URL app untuk redirect konfirmasi email
```

Jalankan server pengembangan:

```bash
npm run dev
```

## Perintah

```bash
npm run dev        # dev server (port 5173)
npm run build      # vue-tsc typecheck + vite build → dist/
npm run preview    # preview hasil build
npm test           # vitest run (unit: kalkulator, status, rekap, lapisan data, offline, render)
npm run lint       # eslint — wajib bersih sebelum commit
```

Uji cepat satu area kalkulator: `npx vitest run src/lib/kalkulator`.

## Struktur

```
src/
  modules/<modul>/   # per-modul: views/, db.ts (layanan data), routes.ts
  views/             # halaman app-level (landing, dashboard, kalkulator, login)
  components/        # komponen bersama (kurva WHO, form, UI)
  lib/               # kalkulator WHO, status, KBM, rekap, antrean offline, galat, label
  composables/       # statistik publik, daftar modul
  supabase/          # klien + useAuth
supabase/migrations/ # skema DB, RLS, fungsi publik (idempotent)
refrences/           # CSV referensi WHO (sumber data tabel.ts — jangan diedit manual)
```

Alias impor `@` → `src`.

## Deploy

- **GitHub Pages** (aktif): push `main` → workflow `.github/workflows/deploy-pages.yml`
  (lint → test → build → deploy) otomatis me-layout ke
  `https://<user>.github.io/posyandu/` (jalankan `npm run build -- --base=/posyandu/` untuk uji lokal;
  deep-link ditangani `public/404.html`).
- **Vercel** (target final): `vercel.json` sudah berisi SPA rewrite agar deep-link tidak 404.

## Supabase

- Struktur DB + RLS ada di `supabase/migrations/` (idempotent, aman dijalankan ulang).
- Terapkan ke remote: `npx supabase db push` (butuh password DB) atau SQL Editor dashboard.
- Status peran: fungsi `is_admin()` + tabel `user_peran`; akun dibuat pengelola (tanpa pendaftaran mandiri).

## Dokumentasi

- **PRD.md** — living document produk (roadmap fase + changelog batch)
- **AGENTS.md** — panduan agent rinci (struktur per-file, konvensi, masalah dikenal)
- **CLAUDE.md** — ringkasan untuk Claude Code

## Kredit

Dikembangkan oleh **Awan**.