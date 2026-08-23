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
- Ikon: `@lucide/vue`; Ekspor rekap: SheetJS `xlsx` (client-side)
- Perhitungan: TS port dari kalkulator Python (metode LMS WHO, z-score) di `src/lib/kalkulator/`
- Font: **IBM Plex Sans** (formal, variabel 400–700, bundel woff2 lokal di `public/fonts/`) — dipakai untuk display & body (konsisten, mudah dibaca semua orang)
- Backend: Supabase (PostgreSQL + Auth/RLS) — fase data, lihat PRD; `@supabase/supabase-js` sudah terpasang
- Deploy: **GitHub Pages** aktif (lihat workflow + rincian di bawah); **Vercel** target final (SPA rewrite di `vercel.json` sudah siap)
- Test: Vitest (unit kalkulator/status/bumil + smoke test render komponen)
- Lint: ESLint 9 flat config (`eslint.config.ts`) + typescript-eslint 8 + eslint-plugin-vue 10 — `npm run lint`

## Setup & Perintah
- `npm install`                        # pasang semua dependensi
- `npm run dev`                        # dev server (port 5173)
- `npm run build`                      # vue-tsc typecheck + vite build → `dist/`
- `npm run preview`                    # preview hasil build
- `npm test`                           # vitest run (kalkulator + status/bumil + render; baseline 88 hijau)
- `npm run lint`                       # eslint . (wajib bersih sebelum commit)
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
- `src/router/index.ts` — rute `/` (landing), `/kalkulator`, `/login`, `/dashboard` (publik) + rute modul via spread (mis. `...balitaRoutes` dari `src/modules/balita/routes.ts`); guard `requiresAuth` + `requiresAdmin` di `beforeEach`; lazy-load, fallback `*` → `/`; `scrollBehavior` (scroll ke anchor `/#indikator`, `/#tentang`; selain itu ke atas; hormati `prefers-reduced-motion`)
- `src/modules/` — **struktur per-modul** (fondasi multi-posyandu): tiap modul punya `views/` (list/form/detail), `db.ts` (lapisan data modul), `routes.ts` (rute + meta guard). Saat ini **modul `balita` & `bumil`** aktif; modul lain (remaja, dewasa & lansia) menyusul dengan menyalin *shape* folder ini — cukup tambah `...<modul>Routes` di router tanpa mengubah struktur inti. Jangan menumpuk service/views modul baru di `src/views/` atau file `db.ts` app-level — taruh di `src/modules/<modul>/`.
  - `src/modules/balita/views/` — `BalitaListView.vue`, `BalitaFormView.vue` (baru/edit), `BalitaDetailView.vue` (identitas + kurva tabs + riwayat + form kunjungan lengkap; riwayat **satu tabel dengan scroll horizontal internal** (min-w tinggi) diurutkan **kronologis naik** (Januari→Desember), status LiKA/LiLA dihitung otomatis saat form kunjungan diisi (preview memakai `hitungUmurBulan` — umur kalender, sama dengan logika penyimpanan); pencarian daftar mencocokkan `nama`/`nama_orang_tua`/`nik`; grid item kiri wajib `min-w-0` agar halaman tidak melebar horizontal; sejak v2.11.2 kerangka (295 baris) yang memakai komponen anak di `views/detail/`: `FormKunjunganBalita.vue` (props `balita`+`isAdmin`, emit `tersimpan`), `TabelRiwayatBalita.vue` (props `kunjungan`+`isAdmin`, emit `hapus`), & `KurvaTabsBalita.vue` (props `balita`+`kunjungan`)), `BalitaRekapView.vue` (rekap bulanan: filter mode **Bulanan** (bulan+tahun) / **Rentang** (tanggal bebas), kartu ringkasan, tabel **format resmi Rekap Bulanan Posyandu** (32 baris kategori via `BARIS_RINGKASAN`; tanpa scroll horizontal di mobile — kolom Keterangan wrap alami), tabel rincian per balita (scroll horizontal), aksi **Ekspor Excel** (`xlsx`), **Salin CSV**, **Cetak/PDF** (`window.print` + CSS `@media print`; class `print-only`/`print-area`/`no-print`))
  - `src/modules/balita/rekap.ts` — logika murni rekap (tanpa Supabase): `filterKunjunganPeriode`/`filterKunjunganRentang`, `rekapPerBalita` (satu suara per balita, kunjungan terakhir), `klasifikasiSasaran` (bayi < 12 bln / balita 12–60 bln), `hitungRekapBulanan` (sasaran, kehadiran bayi & balita terpisah, ceklis, BB naik, status Normal/Tidak Normal per indikator, layanan Ya/Tidak; **aturan rekap baku:** nilai terisi & bukan Ya/Normal → "Tidak"/**"Tidak Normal"**, nilai kosong/tak diisi → **tidak masuk hitungan kedua kolom**, berlaku untuk semua pasangan Ya/Tidak, Normal/Tidak Normal, dan Naik/Tidak Naik), `susunBarisRekap`; interface `RekapBulanan`/`BarisRekap`/`PeriodeRekap`
  - `src/modules/balita/ekspor.ts` — `BARIS_RINGKASAN` (sumber tunggal pasangan label+ambil untuk sheet & tabel UI), `susunLembarRingkasan`/`susunLembarRincian`, `buatWorkbookRekap` (sheet Ringkasan + Rincian), `unduhXlsx`, `teksCsvRekap`, `labelPeriode`
  - `src/modules/balita/db.ts` — service CRUD balita & kunjungan; status dihitung kalkulator TS lalu disimpan sebagai label Indonesia; plus fungsi dashboard `kunjunganTerakhir()` (RPC `kunjungan_terakhir`) & `balitaPerluPerhatian()` (filter status buruk/kurang) untuk seksi "Balita yang perlu perhatian"
  - `src/modules/balita/routes.ts` — rute `/balita*` (`requiresAuth` + `requiresAdmin` di meta); `/balita/rekap` hanya `requiresAuth` (rekap read-only, semua kader)
  - `src/modules/bumil/views/` — `BumilListView.vue` (pencarian daftar mencocokkan `nama`/`nama_suami`/`nik`/`dusun`), `BumilFormView.vue` (baru/edit), `BumilDetailView.vue` (identitas + riwayat kunjungan tabel scroll horizontal — usia kehamilan bersatuan **minggu** + ringkasan kunjungan terakhir + form kunjungan antenatal lengkap: usia kehamilan, BB & sesuai kurva KIA, LiLA + status hijau/merah, tekanan darah & sesuai kurva KIA, skrining gejala/TBC/TTD/MT KEK/kelas bumil/edukasi/rujuk; field khusus kehamilan disembunyikan saat kategori **Menyusui**; sejak v2.11.2 kerangka (333 baris) yang memakai komponen anak di `views/detail/`: `FormKunjunganBumil.vue` (form antenatal; props `bumil`+`isAdmin`, emit `tersimpan`) & `TabelRiwayatBumil.vue` (props `kunjungan`+`isAdmin`, emit `hapus`))
  - `src/modules/bumil/db.ts` — service CRUD bumil & kunjungan; **tidak ada z-score WHO utk kehamilan** → status (BB sesuai kurva KIA, LiLA, TD) disimpan sebagai pilihan manual dari konstanta `OPSI_*`; helper `labelYaTidak`; kunjungan terhubung lewat FK `bumil_id` (tabel lama pakai `nama`, migrasi backfill)
  - `src/modules/bumil/routes.ts` — rute `/bumil*` (`requiresAuth` + `requiresAdmin` di meta)
- `src/views/` — halaman app-level (bukan per-modul): `LandingView.vue` (hero sistem informasi posyandu digital + motto "Sehat & mandiri untuk semua", seksi statistik bulan berjalan via RPC publik `statistik_publik()` (**dipecah per sasaran**: `balita_bayi`/`balita_balita`, `bumil_hamil`/`bumil_menyusui`, persentase kunjungan Balita & Bumil/Menyusui dihitung client-side, `kunjungan_bulan_ini` sebagai badge; fallback `–`/tersembunyi bila DB tak tersedia; latar gradasi blob + kartu kaca glassmorphism ala iOS), seksi layanan 4 sasaran (Balita & Bumil aktif, Remaja/Dewasa & Lansia "Segera"), kalkulator kilat interaktif (dipindah dari hero), cara pakai, tentang standar WHO + privasi, CTA masuk kader; sejak v2.11.1 kerangka tipis (49 baris) yang menyusun komponen seksi di `src/views/landing/`: LandingHero/LandingStatistik/LandingLayanan/LandingKalkulatorKilat/LandingCaraPakai/LandingTentang/LandingCta + `kampanye.ts` (flag & teks HUT ter-dedup)), `DashboardView.vue` (hub publik: hero sambutan berbeda utk anon vs kader login — anon melihat statistik + modul + CTA login/kalkulator tanpa data perorangan; kader admin melihat badge Admin + tombol Tambah Balita + seksi **"Balita yang perlu perhatian"** (kunjungan terakhir berstatus Kurang/Sangat Kurang/Pendek/Sangat Pendek/Gizi Buruk/Gizi Kurang via RPC `kunjungan_terakhir`, dengan StatusBadge per indikator) + info privasi; statistik bulan berjalan dari `statistik_publik()`; kartu kaca glassmorphism; skeleton saat fetch), `KalkulatorView.vue` (kalkulasi live tanpa tombol hitung: hasil & kurva otomatis saat data lengkap; validasi per-field on-blur dengan `aria-describedby`/`aria-invalid`/live region `role="status"`; tabs kurva BB/U · TB/U · BB/TB; peringatan implausibel |z| > 5 non-blocking; ringkasan + tombol salin), `LoginView.vue` (masuk/daftar kader; redirect default `/dashboard`)
- `src/components/` — `KurvaWHO.vue` (kurva WHO self-draw + titik z-score; mode `bbu`/`tbu`/`bbtb`/`lika`/`lila`), `StatusBadge.vue` (label lengkap saja, tanpa kode), `Skeleton.vue` (blok loading animate-pulse untuk halaman fetch data), `AppNavbar.vue` (brand statis "Posyandu Wapalo" **bold**, tautan Beranda/Tentang/Dashboard + dropdown modul **Data Balita** (label dinamis: "Balita" di `/balita*`, "Bumil" di `/bumil*`, default "Data Balita"; tersedia desktop & mobile dalam sheet; menu desktop absolutely positioned agar layout stabil), tab aktif benar utk rute & anchor `#tentang` via IntersectionObserver, frosted glass), `AppFooter.vue` (info © + credit "Dikembangkan oleh Awan" di baris paling bawah; `mt-auto` → sticky di dasar viewport via layout `flex min-h-screen flex-col` di `App.vue`), `Reveal.vue`, `ui/` (komponen shadcn-vue; `Card` punya varian `solid`/`glass`/`glass-strong`)
- `src/lib/kalkulator/index.ts` — port TS `hitungSemuaStatus(jk, umurBulan, beratBadan, panjangBadan)` → `{status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, error}`; plus `hitungZLik`/`hitungZLil` (lingkar kepala/lengan) & `klasifikasiLika`/`klasifikasiLila`
- `src/lib/kalkulator/tabel.ts` — data WHO hasil konversi CSV (jangan edit manual): `wfa`, `lhfa*2y/5y`, `wfl/wfh`, `hcfa*`, `acfa*`
- `src/lib/kalkulator/__fixtures__/expected.json` — fixture output Python lama untuk validasi port
- `src/lib/umur.ts` — hitung umur bulan (kalender) + parse tanggal lokal + `umurSaatIni`
- `src/lib/status.ts` — metadata status (label, deskripsi, tone warna) + `labelStatus`/`kodeDariLabel` (kode↔label Indonesia, termasuk varian data lama)
- `src/supabase/client.ts` — klien Supabase (aktif hanya bila env var terisi) + `wajibSupabase()` (lapisan data per modul)
- `src/supabase/useAuth.ts` — composable auth (session, masuk, daftar, keluar) + `isAdmin` via `rpc('is_admin')`; `signUp` memakai `emailRedirectTo = VITE_APP_URL || origin + BASE_URL`
- `supabase/` — CLI project (`config.toml`) + `migrations/*.sql` (schema, relasi, RLS, fungsi publik); `.temp/` & `.branches` di-ignore
- `refrences/` — CSV referensi WHO (sumber data `tabel.ts`; CATATAN: folder ditulis `refrences`, bukan `references`)
- `.env` — `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (gitignored); templat di `.env.example`
- `vercel.json` — SPA rewrite agar deep-link tidak 404

## Data & Klasifikasi Status
- Indikator: BB/U (wfa), TB/U (lhfa), BB/TB (wfl < 24 bln, wfh >= 24 bln), LiKA (hcfa), LiLA (acfa)
- BB/U: SK (<-3), K (-3..-2), N (-2..+1), RBL (>+1)
- TB/U: SP, P, N, T (batas sama dgn BB/U)
- BB/TB (6 kategori): GB (<-3 "Gizi Buruk"), GK (-3..-2 "Gizi Kurang"), GN (-2..+1 "Gizi Baik"), RGL (>+1..+2 "Risiko Gizi Lebih"), GL (>+2..+3 "Gizi Lebih"), O (>+3 "Obesitas")
- LiKA: MS (<-2), N (-2..+2), MK (>+2); LiLA: GK (<-2), N (>= -2)
- BB/TB dicari berdasarkan panjang/tinggi badan (baris terdekat), bukan umur
- Umur < 24 bulan: tabel lhfa/wfl versi `2_years`; >= 24 bulan: versi `5_years`
- Umur < 13 minggu: tabel mingguan (`*_13_weeks.csv`, kolom `Week`) tersedia tapi belum dipakai
- Umur dihitung otomatis dari tanggal lahir vs tanggal kunjungan (kalender); bila tanggal lahir kosong, `umur_bulan` + status BB/U·TB/U·BB/TB disimpan `null` sampai tanggal lahir diisi
- Skor-z dibulatkan 2 desimal untuk tampilan; klasifikasi memakai skor-z mentah
- Rumus LMS: `l==0 → ln(x/M)/S`; selain itu `((x/M)^l - 1)/(l*s)`

## Modul Antropometri (standar WHO)
Sistem menerapkan klasifikasi antropometri **WHO Child Growth Standards (0–60 bulan)** dengan 3 indikator
independen + 2 indikator lingkar yang tidak pernah digabung menjadi satu z-score:
- **BB/U** — berat menurut umur (wfa): indikator berat; tidak dipakai untuk stunting/wasting/obesitas
- **TB/U (PB/U)** — panjang/tinggi menurut umur (lhfa): indikator pertumbuhan linear/stunting;
  `TB/U < -2` = stunting (`SP` = stunting berat, `P` = pendek) — **bukan** "gizi buruk"
- **BB/TB (BB/PB)** — berat menurut panjang/tinggi (wfl/wfh): indikator wasting/overweight/obesitas;
  lookup berdasarkan panjang/tinggi (baris terdekat), **bukan umur**
- **LiKA/U** — lingkar kepala menurut umur (hcfa): MS/MK
- **LiLA/U** — lingkar lengan atas (MUAC) menurut umur (acfa): GK/N

Pemilihan PB vs TB mengikuti umur (< 24 bln → PB, >= 24 bln → TB); `measurement_type` eksplisit
belum disimpan di DB (kolomnya tidak ada). Status disimpan **terpisah per indikator** sebagai label
Indonesia (mis. `Normal`, `Pendek`, `Gizi Buruk`) + z-score mentah (untuk kurva).

Referensi data WHO (`tabel.ts` dari `refrences/*.csv`) **dipisah dari logika klasifikasi**; pembaruan
standar cukup mengganti data tabel tanpa mengubah fungsi klasifikasi. Validasi sebelum klasifikasi:
jk wajib, tanggal lahir wajib valid, tanggal pengukuran tidak boleh sebelum tanggal lahir, BB > 0,
PB/TB > 0; data tidak valid → tidak diklasifikasi (error).

## Konvensi
- Bahasa Indonesia untuk kode, komentar, dan pesan
- Class status: string pendek seperti `SK`, `K`, `N`, `RBL`, `SP`, `P`, `T`, `GB`, `GK`, `GN`, `RGL`, `GL`, `O`
- Git commit: `(Update vX.Y.Z) Deskripsi singkat`
- Seluruh perhitungan di sisi klien (browser) — jangan pindahkan ke server tanpa alasan
- Komponen UI baru: pakai primitif shadcn-vue di `src/components/ui/` bila ada, selain itu pola cva (class-variance-authority)
- Tema: palet hijau klinis di `src/style.css` (`:root` + `@theme inline`); jangan hardcode warna.
  `--primary` = `#047857` (emerald-700, kontras putih ≥ 4.5:1 / AA) — jangan digelapkan/diterangkan lagi;
  input form memakai `h-12 md:h-10` (48px mobile utk target sentuh, 40px desktop) via konstanta `klsInput`.

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
4. **Fase data aktif:** Supabase Auth (email/password) + RLS ketat sudah jalan. `anon` bisa landing, kalkulator & `/dashboard` (hub publik); `/balita*` butuh login (guard redirect). **Peran admin** (`public.user_peran` + fungsi `is_admin()`): hanya admin yang bisa tulis/edit/hapus (RLS + gating UI); user biasa read-only. Status disimpan sebagai label Indonesia (`Normal`, `Kurang`, `Gizi Buruk`, dst); `src/modules/balita/db.ts` + `src/lib/status.ts` memetakan kode↔label.
5. **Supabase email confirmation ON di remote** (`mailer_autoconfirm=false`) — akun baru lewat UI `/login` butuh konfirmasi email. Catatan: `supabase/config.toml` lokal memakai `enable_confirmations = false` (tanpa konfirmasi), jadi perilaku lokal vs remote berbeda. Akun uji `e2e-kader@posyandu.test` dibuat manual (email_confirmed_at terisi + semua kolom token auth diisi string non-NULL).
6. **Bug GoAuth scan:** bila kolom token di `auth.users` NULL (mis. user dibuat manual), login gagal dengan "Database error querying schema" / "converting NULL to string". Workaround: isi `confirmation_token`, `recovery_token`, `email_change`, dll dengan string kosong.
7. **Migrasi:** `supabase/migrations/` dipakai untuk replikasi fresh; perubahan yang sudah diterapkan ke remote dicatat di `supabase_migrations.schema_migrations` (jalur CLI butuh password DB — kalau belum ada, apply via dashboard SQL Editor).
8. Registry shadcn-vue tidak terjangkau dari environment ini — komponen `src/components/ui/` disalin manual dari repo `unovue/shadcn-vue` (branch `dev`, registry `new-york-v4`)
9. **Spacing CardContent:** komponen `CardContent` hanya merender `<div class="px-6">` tanpa flex/grid — `gap-*` di class-nya tidak bekerja. Gunakan `CardContent class="flex flex-col gap-N"` bila ingin jarak antar anak (telah diterapkan di KalkulatorView/LoginView/DashboardView/BalitaListView/BalitaFormView/BalitaDetailView; `gap-0` di LandingView sengaja tanpa jarak).
10. **Statistik publik (landing):** anonim tidak punya SELECT ke tabel data anak (RLS ketat), jadi statistik landing memakai fungsi `public.statistik_publik()` (SECURITY DEFINER, `search_path=public`, revoke public + grant anon/authenticated) yang **hanya mengembalikan COUNT agregat** (`balita_bayi`/`balita_balita`, `bumil_hamil`/`bumil_menyusui`, `kunjungan_balita_bulan_ini` (distinct), `kunjungan_bumil_bulan_ini` (distinct), `kunjungan_bulan_ini` (semua baris bulan berjalan), `bulan_ini`) — tanpa data perorangan. Persentase kunjungan Balita & Bumil/Menyusui dihitung di client. Landing fetch via `supabase.rpc('statistik_publik')` di `onMounted`; bila env Supabase kosong/error → seksi statistik disembunyikan.
11. **Kunjungan terakhir (dashboard kader):** seksi "Balita yang perlu perhatian" memakai fungsi `public.kunjungan_terakhir()` (**SECURITY INVOKER** — RLS tetap berlaku) yang mengembalikan kunjungan terakhir per balita (nama, tanggal lahir/kunjungan, status BB/U·TB/U·BB/TB). Hanya `authenticated` yang boleh execute (`revoke public` + `revoke anon` eksplisit + `grant authenticated`); Supabase auto-grant EXECUTE ke anon/authenticated sehingga perlu `revoke ... from anon` tambahan. Anon yang memanggil mendapat 401 permission denied. Filter "perlu perhatian" (Kurang/Sangat Kurang/Pendek/Sangat Pendek/Gizi Buruk/Gizi Kurang) dilakukan di client (`balitaPerluPerhatian()`).

## Kolaborasi Tim

- **Awan** — Founder & pemilik produk: penentu arah, keputusan akhir, dan pemilik visi.
- **Alpha** — CEO (asisten Hermes / agent orchestrator): memimpin eksekusi, menyusun rencana,
  menjalankan OpenCode CLI sebagai pekerja coding, memverifikasi hasil (build/test), dan
  melaporkan ke Awan.
- **OpenCode CLI** — pekerja coding otonom (model bawaan, saat ini `big-pickle`):
  dikendalikan Alpha lewat `opencode run` (one-shot) atau sesi interaktif; bekerja di dalam
  repo ini dan patuh pada AGENTS.md.
- Alur kerja: Awan memberi misi → Alpha menyusun rencana & mengeksekusi (mendelegasikan tugas
  coding ke OpenCode bila perlu) → hasil diverifikasi → dilaporkan ke Awan.
- Bahasa tim: **Indonesia** di semua komunikasi, kode, komentar, dan commit.
- Setiap perubahan perilaku aplikasi: perbarui PRD.md dan AGENTS.md agar tetap sinkron dengan
  kode, lalu commit dengan konvensi `(Update vX.Y.Z) Deskripsi`.
- Kontrol versi: **commit** dilakukan mandiri oleh Zero (konvensi `(Update vX.Y.Z)`); **push**
  ke remote hanya dilakukan atas instruksi eksplisit dari Awan.

### Alur Pengembangan Fitur

1. **Awan** memberikan ide/misi dalam bahasa bebas (mentah, belum tentu terstruktur).
2. **Alpha** mematangkan ide tersebut menjadi spesifikasi kerja: tujuan, cakupan perubahan,
   file/komponen yang terpengaruh, kriteria penerimaan, dan catatan risiko — lalu menyampaikan
   spesifikasi ini ke OpenCode CLI.
3. **OpenCode CLI** mengimplementasikan sesuai spesifikasi (one-shot `opencode run '...'` untuk
   tugas terbatas, atau sesi interaktif untuk tugas panjang), patuh pada AGENTS.md & PRD.md.
4. **Alpha** memverifikasi hasil: `npm run build` (vue-tsc + vite), `npm test` (vitest), review
   diff, dan memastikan PRD.md/AGENTS.md disinkronkan dengan perubahan perilaku.
5. **Awan** menerima laporan hasil + risiko tersisa (jika ada) dan memutuskan langkah berikutnya.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
