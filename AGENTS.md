# AGENTS.md

## Project Overview
Aplikasi web Kalkulator Status Gizi Anak (Posyandu) berbasis standar pertumbuhan WHO
(metode LMS). Bahasa: Indonesia (kode, komentar, dan UI).

Arsitektur saat ini: **SPA Vite + Vue 3** dengan perhitungan **client-side (TypeScript)**,
backend masa depan memakai **Supabase** (BaaS). Rencana pengembangan jangka panjang
terdokumentasi di **PRD.md** (living document); jaga agar AGENTS.md dan PRD.md tetap sinkron.

## Tech Stack
- Frontend: Vue 3 SPA + TypeScript + Vite 8 (bundler), Vue Router (SPA, lazy routes)
- UI: shadcn-vue (komponen `src/components/ui/`) + Tailwind CSS v4 (`@tailwindcss/vite`)
- Ikon: `@lucide/vue`
- Perhitungan: TS port dari kalkulator Python (metode LMS WHO, z-score) di `src/lib/kalkulator/`
- Font: Varela Round (display) + Nunito Sans (body) — bundel woff2 lokal di `public/fonts/`
- Backend: Supabase (PostgreSQL + Auth/RLS) — fase data, lihat PRD; `@supabase/supabase-js` sudah terpasang
- Deploy: Vercel (static SPA, lihat `vercel.json`)
- Test: Vitest (unit kalkulator + smoke test render komponen)

## Setup & Perintah
- `npm install`                        # pasang semua dependensi
- `npm run dev`                        # dev server (port 5173)
- `npm run build`                      # vue-tsc typecheck + vite build → `dist/`
- `npm run preview`                    # preview hasil build
- `npm test`                           # vitest run (kalkulator + render)
- Uji kalkulator cepat: `npx vitest run src/lib/kalkulator`
- Build ulang font/sumber data: `refrences/*.csv` → `src/lib/kalkulator/tabel.ts` (lihat skrip konversi)

## Struktur Proyek
- `index.html` — entry HTML SPA (mount `#app`); `public/` (favicon, font woff2)
- `src/main.ts` — bootstrap app + router
- `src/router/index.ts` — rute `/` (landing) & `/kalkulator` (kalkulator), lazy-load, fallback `*` → `/`
- `src/views/` — `LandingView.vue` (hero interaktif + kurva WHO), `KalkulatorView.vue` (form + hasil)
- `src/components/` — `KurvaWHO.vue` (kurva WHO self-draw + titik z-score), `StatusBadge.vue`, `AppNavbar.vue`, `AppFooter.vue`, `Reveal.vue`, `ui/` (komponen shadcn-vue)
- `src/lib/kalkulator/index.ts` — port TS `hitungSemuaStatus(jk, umurBulan, beratBadan, panjangBadan)` → `{status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, error}`
- `src/lib/kalkulator/tabel.ts` — data WHO hasil konversi CSV (jangan edit manual)
- `src/lib/kalkulator/__fixtures__/expected.json` — fixture output Python lama untuk validasi port
- `src/lib/umur.ts` — hitung umur bulan (kalender) + parse tanggal lokal
- `src/lib/status.ts` — metadata status (label, deskripsi, tone warna)
- `src/supabase/client.ts` — klien Supabase (aktif hanya bila env var terisi)
- `refrences/` — CSV referensi WHO (sumber data `tabel.ts`; CATATAN: folder ditulis `refrences`, bukan `references`)
- `.env` — `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (placeholder, fase data)
- `vercel.json` — SPA rewrite agar deep-link tidak 404

## Data & Klasifikasi Status
- Indikator: BB/U (wfa), TB/U (lhfa), BB/TB (wfl < 24 bln, wfh >= 24 bln)
- BB/U: SK (<-3), K (-3..-2), N (-2..+1), RBL (>+1)
- TB/U: SP, P, N, T (batas sama dgn BB/U)
- BB/TB: GK (<-2), GB (-2..+1), GL (>+1..+3), O (>+3)
- BB/TB dicari berdasarkan panjang/tinggi badan (baris terdekat), bukan umur
- Umur < 24 bulan: tabel lhfa/wfl versi `2_years`; >= 24 bulan: versi `5_years`
- Umur < 13 minggu: tabel mingguan (`*_13_weeks.csv`, kolom `Week`) tersedia tapi belum dipakai
- Skor-z dibulatkan 2 desimal untuk tampilan; klasifikasi memakai skor-z mentah
- Rumus LMS: `l==0 → ln(x/M)/S`; selain itu `((x/M)^l - 1)/(l*s)`

## Konvensi
- Bahasa Indonesia untuk kode, komentar, dan pesan
- Class status: string pendek seperti `SK`, `K`, `N`, `RBL`, `SP`, `P`, `T`, `GK`, `GB`, `GL`, `O`
- Git commit: `(Update vX.Y.Z) Deskripsi singkat`
- Seluruh perhitungan di sisi klien (browser) — jangan pindahkan ke server tanpa alasan
- Komponen UI baru: pakai primitif shadcn-vue di `src/components/ui/` bila ada, selain itu pola cva (class-variance-authority)
- Tema: palet hijau klinis di `src/style.css` (`:root` + `@theme inline`); jangan hardcode warna

## Konvensi Git & Perawatan Repo
- JANGAN commit `node_modules/`, `dist/`, `.env`, `venv/`, `__pycache__/`, `instance/*.db`
- Jangan memodifikasi file CSV referensi WHO tanpa verifikasi skema kolom
- `src/lib/kalkulator/tabel.ts` dihasilkan dari `refrences/*.csv` — regenerasi lewat skrip, bukan edit manual
- Saat mengubah kalkulator, jalankan `npm test` (validasi vs fixture Python)
- Ketika menambah dependensi npm, ikuti versi eksisting (vue-router v5, vite 8, tailwindcss 4)

## Masalah Dikenal / Catatan
1. Kalkulator TS sudah divalidasi vs fixture Python (20 kasus, toleransi z ±0.005)
2. Lingkar lengan & kepala belum ada di UI (akan menyusul di fase data)
3. `kesimpulan_bb_bulan_lalu` belum ada (butuh riwayat pengukuran sebelumnya)
4. Umur < 13 minggu masih dihitung per bulan (tabel mingguan belum dipakai)
5. Fase berikutnya: schema Supabase + Auth/RLS + CRUD balita/pengukuran (lihat PRD)
6. Registry shadcn-vue tidak terjangkau dari environment ini — komponen `src/components/ui/` disalin manual dari repo `unovue/shadcn-vue` (branch `dev`, registry `new-york-v4`)
