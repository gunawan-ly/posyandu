# Tugas: Navbar 5 modul + Modul Dewasa & Lansia + Statistik Apras di Beranda

Repo: proyek Posyandu Wapalo (Vue 3 + TS + Vite + Tailwind 4 + shadcn-vue).
Seluruh bahasa Indonesia (kode, komentar, UI). JANGAN commit — kerjakan perubahan saja.

## Latar
- Navbar (`src/components/AppNavbar.vue`) baru memuat Balita & Bumil di `MODUL`.
- Rute Apras & Remaja SUDAH terdaftar di `src/router/index.ts` (via spread routes).
- Modul Dewasa & Lansia BELUM ada sama sekali.
- Beranda `src/views/DashboardView.vue` seksi "Statistik posyandu" membaca RPC
  Supabase `statistik_publik()` (interface `StatistikPublik` + computed `KARTU_STATISTIK`).

## Pekerjaan

### 1. Navbar (src/components/AppNavbar.vue)
- `MODUL` jadi 5 entri berurutan:
  `{ label: 'Balita', to: '/balita' }`, `{ label: 'Bumil', to: '/bumil' }`,
  `{ label: 'Apras', to: '/apras' }`, `{ label: 'Remaja', to: '/remaja' }`,
  `{ label: 'Dewasa & Lansia', to: '/lansia' }`
- Hapus hardcode path di `labelModul`, `modulAktif`, dan logika aktif lain:
  buat turunan generik dari daftar `MODUL` (mis. cari entri yang `route.path.startsWith(m.to)`),
  sehingga menambah modul baru cukup edit daftar.
  - Perilaku `labelModul`: label modul yang cocok dengan path saat ini, fallback 'Modul Data'.
  - Perilaku `modulAktif()`: true bila path diawali salah satu `m.to`.
  - `itemModulAktif(to)` tetap seperti semula.
- Dropdown desktop DAN menu mobile otomatis ikut karena keduanya me-render `MODUL`.

### 2. Modul placeholder Dewasa & Lansia
- Buat folder `src/modules/lansia/` mengikuti pola modul `remaja`:
  - `routes.ts`: ekspor `lansiaRoutes`; rute `/lansia` (name `'lansia'`) → view placeholder,
    meta `{ requiresAuth: true }`; rute `/lansia/baru`, `/lansia/:id/edit`, `/lansia/:id`
    cukup redirect ke name `'lansia'` (lihat persis pola `src/modules/remaja/routes.ts`).
  - `views/LansiaListView.vue`: render `PlaceholderModul` dari
    `@/modules/apras/views/PlaceholderModul.vue` dengan:
    nama-modul="Dewasa & Lansia", rentang-usia="Dewasa & Lansia",
    deskripsi-singkat="Pemantauan kesehatan dewasa dan lansia di posyandu."
  - `db.ts`: komentar TODO fase placeholder (tanpa fungsi), pola `src/modules/remaja/db.ts`.
- Daftarkan `...lansiaRoutes` di `src/router/index.ts` (impor + spread, urut setelah remaja).

### 3. Statistik Posyandu tambah Apras
- Migrasi BARU `supabase/migrations/20260825000000_statistik_publik_apras.sql`:
  `create or replace function public.statistik_publik()` versi v3 yang MENYALIN seluruh isi
  migrasi `20260820000000_statistik_publik_split.sql` lalu menambah key jsonb:
  - `'apras_total'`: count(*) from public.apras_identitas
  - `'kunjungan_apras_bulan_ini'`: count(distinct apras_id) from public.apras_kunjungan
    pada bulan berjalan (pola tanggal sama dengan kunjungan balita/bumil)
  - total `'kunjungan_bulan_ini'` kini = balita + bumil + apras (count semua baris)
  - Pertahankan header komentar gaya migrasi sebelumnya (jelaskan perubahan v3),
    `security definer`, `set search_path = public`, revoke/grant yang sama.
  - CEK dulu nama tabel aktual di `20260824000000_modul_apras.sql` /
    `20260824000001_modul_apras_kunjungan.sql` (dugaan: `apras_identitas` & `apras_kunjungan`)
    dan pakai nama kolom FK yang benar.
- `src/views/DashboardView.vue`:
  - Interface `StatistikPublik`: tambah `apras_total: number` & `kunjungan_apras_bulan_ini: number`.
  - `KARTU_STATISTIK`: sisipkan 2 kartu setelah kartu "Balita" sehingga urutan:
    Bayi, Balita, **Apras** (ikon `UserRound`, nilai `apras_total`, akhiran 'anak',
    keterangan 'sasaran 5–6 tahun'), Ibu Hamil, Ibu Menyusui,
    Kunjungan Balita (%), **Kunjungan Apras** (%) — ikon `UserRound`, dari
    `persen(kunjungan_apras_bulan_ini, apras_total)`, keterangan
    `bulan ini dari ${apras_total} sasaran` — , Kunjungan Bumil/Menyusui (%). Total 8 kartu.
  - Grid statistik sudah `sm:grid-cols-2 lg:grid-cols-4` → 8 kartu jadi 4×2; pastikan skeleton
    loading (v-for i in 4) masih wajar.

## Batasan
- JANGAN menyentuh palet/tema (`--primary`), jangan refactor `PlaceholderModul`.
- Jangan ubah perilaku selain yang disebut. Tidak ada perubahan teks landing lain.
- Ikuti konvensi AGENTS.md (kelas input, CardContent pakai flex eksplisit, dsb.).

## Definisi selesai
- `npm run lint` bersih
- `npm test` hijau (baseline 91)
- `npm run build` sukses
