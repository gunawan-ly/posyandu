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
- Font: Fredoka (display) + Nunito Sans (body) — bundel woff2 lokal di `public/fonts/`
- Backend: Supabase (PostgreSQL + Auth/RLS) — fase data, lihat PRD; `@supabase/supabase-js` sudah terpasang
- Deploy: **GitHub Pages** aktif (lihat workflow + rincian di bawah); **Vercel** target final (SPA rewrite di `vercel.json` sudah siap)
- Test: Vitest (unit kalkulator + smoke test render komponen)

## Setup & Perintah
- `npm install`                        # pasang semua dependensi
- `npm run dev`                        # dev server (port 5173)
- `npm run build`                      # vue-tsc typecheck + vite build → `dist/`
- `npm run preview`                    # preview hasil build
- `npm test`                           # vitest run (kalkulator + render)
- Uji kalkulator cepat: `npx vitest run src/lib/kalkulator`
- `npx supabase link --project-ref <ref>` # tautkan repo ke proyek Supabase
- `npx supabase db push`               # terapkan migrasi `supabase/migrations/` ke remote (meminta password DB)
- `.env.example`                       # templat env (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_APP_URL)
- Deploy GitHub Pages: `npm run build -- --base=/posyandu/` lalu push `main` → workflow `.github/workflows/deploy-pages.yml` (secret `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`/`VITE_APP_URL` diteruskan ke build) otomatis deploy ke `gunawan-ly.github.io/posyandu` (deep-link ditangani `public/404.html` + restore di `src/main.ts`)
- Alias import: `@` → `src` (vite.config.ts + tsconfig paths)
- Sumber data `tabel.ts`: skrip konversi CSV **tidak dicommit** — regenerasi manual (buat skrip ad-hoc dari `refrences/*.csv`, lalu jalankan `npm test`)

## Struktur Proyek
- `index.html` — entry HTML SPA (mount `#app`); `public/` (favicon, font woff2)
- `src/main.ts` — bootstrap app + router
- `src/router/index.ts` — rute `/` (landing), `/kalkulator`, `/login`, `/dashboard` (publik), `/balita*` (guard `requiresAuth` + `requiresAdmin`), lazy-load, fallback `*` → `/`; `scrollBehavior` (scroll ke anchor `/#indikator`, `/#tentang`; selain itu ke atas; hormati `prefers-reduced-motion`)
- `src/views/` — `LandingView.vue` (hero split dengan motif kurva pertumbuhan WHO sebagai elemen tanda tangan + kalkulator kilat interaktif + seksi indikator/cara pakai/tentang/CTA), `DashboardView.vue` (hub publik: modul Balita aktif + Bumil/Remaja/Dewasa & Lansia "Segera"), `KalkulatorView.vue` (kalkulasi live tanpa tombol hitung: hasil & kurva otomatis saat data lengkap; validasi per-field on-blur dengan `aria-describedby`/`aria-invalid`/live region `role="status"`; tabs kurva BB/U · TB/U · BB/TB; peringatan implausibel |z| > 5 non-blocking; ringkasan + tombol salin), `LoginView.vue` (masuk/daftar kader; redirect default `/dashboard`), `BalitaListView.vue`, `BalitaFormView.vue` (baru/edit), `BalitaDetailView.vue` (identitas + kurva tabs + riwayat + form kunjungan lengkap)
- `src/components/` — `KurvaWHO.vue` (kurva WHO self-draw + titik z-score; mode `bbu`/`tbu`/`bbtb`), `StatusBadge.vue` (label lengkap saja, tanpa kode), `AppNavbar.vue` (brand statis "Posyandu Wapalo", tautan Beranda/Tentang/Dashboard + Data Balita saat login, state tautan aktif), `AppFooter.vue`, `Reveal.vue`, `ui/` (komponen shadcn-vue)
- `src/lib/kalkulator/index.ts` — port TS `hitungSemuaStatus(jk, umurBulan, beratBadan, panjangBadan)` → `{status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, error}`
- `src/lib/kalkulator/tabel.ts` — data WHO hasil konversi CSV (jangan edit manual)
- `src/lib/kalkulator/__fixtures__/expected.json` — fixture output Python lama untuk validasi port
- `src/lib/umur.ts` — hitung umur bulan (kalender) + parse tanggal lokal
- `src/lib/status.ts` — metadata status (label, deskripsi, tone warna)
- `src/supabase/client.ts` — klien Supabase (aktif hanya bila env var terisi)
- `src/supabase/useAuth.ts` — composable auth (session, masuk, daftar, keluar) + `isAdmin` via `rpc('is_admin')`; `signUp` memakai `emailRedirectTo = VITE_APP_URL || origin + BASE_URL`
- `src/supabase/db.ts` — service CRUD balita & kunjungan; status dihitung kalkulator TS lalu disimpan sebagai label Indonesia
- `supabase/` — CLI project (`config.toml`) + `migrations/*.sql` (schema, relasi, RLS); `.temp/` & `.branches` di-ignore
- `refrences/` — CSV referensi WHO (sumber data `tabel.ts`; CATATAN: folder ditulis `refrences`, bukan `references`)
- `.env` — `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (gitignored); templat di `.env.example`
- `vercel.json` — SPA rewrite agar deep-link tidak 404

## Data & Klasifikasi Status
- Indikator: BB/U (wfa), TB/U (lhfa), BB/TB (wfl < 24 bln, wfh >= 24 bln)
- BB/U: SK (<-3), K (-3..-2), N (-2..+1), RBL (>+1)
- TB/U: SP, P, N, T (batas sama dgn BB/U)
- BB/TB: GK (<-2, label "Gizi Buruk"), GB (-2..+1), GL (>+1..+3), O (>+3)
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
2. `kesimpulan_bb_bulan_lalu` belum ada (butuh riwayat pengukuran sebelumnya)
3. Umur < 13 minggu masih dihitung per bulan (tabel mingguan belum dipakai)
4. **Fase data aktif:** Supabase Auth (email/password) + RLS ketat sudah jalan. `anon` bisa landing, kalkulator & `/dashboard` (hub publik); `/balita*` butuh login (guard redirect). **Peran admin** (`public.user_peran` + fungsi `is_admin()`): hanya admin yang bisa tulis/edit/hapus (RLS + gating UI); user biasa read-only. Status disimpan sebagai label Indonesia (`Normal`, `Kurus`, `Gizi Buruk`, dst); `src/supabase/db.ts` memetakan kode↔label.
5. **Supabase email confirmation ON di remote** (`mailer_autoconfirm=false`) — akun baru lewat UI `/login` butuh konfirmasi email. Catatan: `supabase/config.toml` lokal memakai `enable_confirmations = false` (tanpa konfirmasi), jadi perilaku lokal vs remote berbeda. Akun uji `e2e-kader@posyandu.test` dibuat manual (email_confirmed_at terisi + semua kolom token auth diisi string non-NULL).
6. **Bug GoAuth scan:** bila kolom token di `auth.users` NULL (mis. user dibuat manual), login gagal dengan "Database error querying schema" / "converting NULL to string". Workaround: isi `confirmation_token`, `recovery_token`, `email_change`, dll dengan string kosong.
7. **Migrasi:** `supabase/migrations/` dipakai untuk replikasi fresh; perubahan yang sudah diterapkan ke remote dicatat di `supabase_migrations.schema_migrations` (jalur CLI butuh password DB — kalau belum ada, apply via dashboard SQL Editor).
8. Registry shadcn-vue tidak terjangkau dari environment ini — komponen `src/components/ui/` disalin manual dari repo `unovue/shadcn-vue` (branch `dev`, registry `new-york-v4`)
9. **Spacing CardContent:** komponen `CardContent` hanya merender `<div class="px-6">` tanpa flex/grid — `gap-*` di class-nya tidak bekerja. Gunakan `CardContent class="flex flex-col gap-N"` bila ingin jarak antar anak (telah diterapkan di KalkulatorView/LoginView/DashboardView/BalitaListView/BalitaFormView/BalitaDetailView; `gap-0` di LandingView sengaja tanpa jarak).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
