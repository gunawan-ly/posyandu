# PRD — Sistem Informasi Posyandu (PosyanduGizi)

Dokumen ini adalah **living document**: terus diperbarui seiring perkembangan project.
Status terakhir: **Fase 1 (MVP) — Pencatatan berjalan** (Auth + RLS + CRUD balita & kunjungan aktif di Supabase; form kunjungan lengkap + dashboard hub publik sudah jalan). Terakhir: halaman kalkulator ditulis ulang menjadi **kalkulasi live** (hasil & kurva muncul otomatis saat data lengkap, tanpa tombol hitung) dengan **validasi per-field on-blur** (aksesibel: `aria-describedby`/`aria-invalid`/live region `role="status"`), **tabs kurva BB/U · TB/U · BB/TB**, **peringatan implausibel** (|z| > 5, non-blocking), serta **ringkasan hasil + tombol salin**; menyusul perbaikan **spacing konsisten antar elemen form** (CardContent kini `flex flex-col gap-*` sehingga jarak antar blok benar-benar aktif). Sebelumnya: landing page didesain ulang dengan **motif kurva pertumbuhan WHO** sebagai elemen tanda tangan, navbar **tanpa animasi ketik**, dan **peran admin** aktif (admin satu-satunya yang bisa menulis; user biasa read-only) + link konfirmasi email diarahkan ke URL produksi (`VITE_APP_URL`).

## 1. Ringkasan Produk

Sistem informasi posyandu untuk satu unit posyandu yang menyimpan dan menampilkan
data balita serta pengukurannya secara terpusat. Berawal dari kalkulator status gizi,
produk ini berkembang menjadi sistem pencatatan lengkap: data balita, pengukuran,
imunisasi & vitamin, riwayat tumbuh kembang, hingga laporan dan dashboard.

Bahasa produk: **Indonesia** (UI, dokumentasi, dan kode).

## 2. Masalah & Peluang

- **Masalah:** Data balita masih dicatat manual di Buku KMS/formulir — rawan hilang,
  sulit direkap, dan tidak memiliki riwayat digital yang mudah dipantau.
- **Peluang:** Satu sumber data digital yang dapat diakses kader dan petugas
  puskesmas, mempermudah pemantauan status gizi, deteksi stunting, dan penyusunan
  laporan.

## 3. Pengguna & Peran

MVP **tanpa autentikasi** untuk fitur kalkulator. Saat fase data (Fase 1) dimulai,
autentikasi **Supabase Auth + RLS diterapkan sejak awal** karena data anak sensitif.

| Peran | Kebutuhan utama |
|---|---|
| Admin / pengelola | Kelola data & konfigurasi sistem |
| Kader posyandu | Input data balita, pengukuran, imunisasi & vitamin |
| Petugas / bidan puskesmas | Memantau data dan menyusun laporan |

Autentikasi berbasis peran sudah aktif: **admin** (tabel `user_peran` + fungsi `is_admin()`) dapat
menambah/mengubah/menghapus data; **user biasa** (kader terautentikasi) read-only.

## 4. Ruang Lingkup

- Satu unit posyandu (struktur data disiapkan agar dapat diperluas ke banyak posyandu).
- Kalkulator tanpa autentikasi; autentikasi + RLS diterapkan sejak awal saat fitur data (Fase 1) diaktifkan.
- Input data secara manual dari Buku KMS/formulir posyandu.
- Data sensitif anak tetap diperlakukan sebagai data pribadi (RLS + kendali akses).

## 5. Fitur & Persyaratan

### Fase 1 (MVP) — Pencatatan
- ✅ Supabase Auth + RLS (data sensitif dilindungi sejak awal; anonim hanya bisa landing, kalkulator & dashboard hub).
- ✅ CRUD data balita: nama, jenis kelamin, tanggal lahir, nama orang tua, posyandu/dusun/alamat (sesuai tabel eksisting `balita_identitas`).
- ✅ Pencatatan kunjungan & pengukuran lengkap: tanggal, BB, PB, lingkar lengan, lingkar kepala, imunisasi, vitamin A, ASI, MP-ASI, obat cacing, ceklis perkembangan, gejala TBC, edukasi; status gizi dihitung otomatis di browser (metode LMS WHO: BB/U, TB/U, BB/TB) lalu disimpan.
- ✅ Daftar balita (cari + hapus) dan halaman detail dengan kurva tabs (BB/U · TB/U · BB/TB) + riwayat kunjungan kolom penuh (scroll horizontal).
- ⏳ UI bumil (schema `bumil_*` sudah ada di DB).
- ✅ Halaman kalkulator tetap tersedia untuk hitung cepat tanpa menyimpan. **Kalkulasi live** (tanpa tombol hitung): hasil & kurva otomatis saat data lengkap; validasi per-field on-blur (tanggal lahir/ukur, BB, PB; `aria-describedby` + live region `role="status"`); tabs kurva BB/U · TB/U · BB/TB; peringatan nilai di luar rentang kewajaran (|z| > 5) non-blocking; ringkasan hasil + tombol salin (clipboard).
- ✅ Dashboard hub publik: menu navigasi modul (Balita aktif; Bumil/Remaja/Dewasa & Lansia "Segera").
- ✅ Peran admin vs user biasa: hanya admin (tabel `user_peran`) yang bisa tulis/edit/hapus (RLS `is_admin()` + gating UI); user biasa read-only. Pendaftaran baru diarahkan ke URL produksi via `emailRedirectTo` (`VITE_APP_URL`).

### Fase 2 — Analisis
- Statistik & rekap: jumlah balita, distribusi status gizi, cakupan kunjungan (hub dashboard sudah ada sebagai navigasi).
- Grafik tumbuh kembang per balita (kurva BB/U, TB/U, BB/TB vs WHO — sudah tersedia di halaman detail, Fase 1).
- Pemantauan stunting: daftar balita berstatus SP/P dan filter berdasarkan status.
- Rekap laporan & ekspor (Excel/PDF) untuk laporan posyandu & puskesmas.

### Fase 3 — Operasional & Lanjutan
- Jadwal posyandu dan pengingat kunjungan balita.
- Peran lanjutan (admin posyandu vs puskesmas), reset password & pengelolaan akun.
- (Potensi) dukungan banyak posyandu dan integrasi e-PPGBM.

## 6. Model Data

Schema **Supabase (PostgreSQL 17)** dengan **Row Level Security**. Diadaptasi dari schema
yang sudah berisi data eksisting (bukan dibuat baru). Semua relasi & audit bersifat *additive*.

- **`balita_identitas`** (eksisting, 63 baris): id (bigint identity), nama, nik, jenis_kelamin
  (`Laki - Laki`/`Perempuan`), tanggal_lahir, tempat_lahir, anak_ke, nama_orang_tua, nik_orang_tua,
  nomor_kk, dusun, alamat, bb_lahir, pb_lahir, posyandu, dibuat_oleh (FK auth.users, trigger → `auth.uid()`), created_at.
- **`balita_kunjungan`** (eksisting, 162 baris): id, **balita_id (FK baru, backfill dari `nama_anak`)**, nama_anak (legacy), tanggal_kunjungan,
  berat_badan, tinggi_badan, lingkar_lengan, lingkar_kepala, status_lingkar_*, ceklis_perkembangan,
  **imunisasi, vitamin_a, asi_eksklusif, mp_asi, obat_cacing, gejala_tbc, edukasi** (kolom per-kunjungan),
  status BB/U–TB/U–BB/TB **disimpan sebagai label Indonesia** (mis. `Normal`, `Kurus`, `Berat Berlebih`),
  **umur_bulan + z_bb_u/tb_u/bb_tb** (dari kalkulator TS), dibuat_oleh, created_at.
- **`bumil_identitas`** (13 baris) & **`bumil_kunjungan`** — schema siap, UI menyusul.
- **`rekap_balita`** & **`rekap_bumil`** — rekap bulanan (Fase 2).
- **RLS ketat:** policy `anon_*` dihapus (sebelumnya anon bisa baca semua data anak & INSERT kunjungan);
  kini `authenticated` bisa SELECT semua; INSERT/UPDATE/DELETE **hanya untuk admin** (fungsi
  `public.is_admin()` dari tabel `user_peran(email, peran)`); INSERT mewajibkan `dibuat_oleh = auth.uid()`
  (diisi trigger). Env var: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon key publik, proteksi lewat
  RLS) & `VITE_APP_URL` (redirect konfirmasi email).

## 7. Teknologi

- Frontend: **Vue 3 SPA + TypeScript + Vite 8**, Vue Router (lazy), Tailwind CSS v4, shadcn-vue, `@lucide/vue` icons; font Fredoka (display) + Nunito Sans (body) dibundel lokal woff2
- Perhitungan: **TypeScript client-side** (metode LMS WHO, z-score) di `src/lib/kalkulator/` — port dari kalkulator Python lama, tervalidasi vs fixture Python
- Database & Auth: **Supabase** (PostgreSQL + Auth/RLS) via `@supabase/supabase-js`
- Deploy: **GitHub Pages** aktif (URL sementara `gunawan-ly.github.io/posyandu`, workflow + `public/404.html` untuk deep-link); **Vercel** sebagai target final (static SPA; `vercel.json` rewrite siap)

## 8. Non-Fungsional

- Responsif: nyaman dipakai di ponsel kader di lapangan.
- Cepat: muat dan input data tanpa hambatan berarti.
- Mudah digunakan oleh pengguna non-teknis (kader).
- Bahasa Indonesia konsisten di seluruh UI.
- Keamanan & privasi data anak diperlakukan serius; autentikasi + RLS ketat aktif sejak fase data,
  dan anonim tidak dapat mengakses data balita.

## 9. Metrik Keberhasilan

- Balita dan kunjungan tercatat secara rutin (target: sesuai jadwal posyandu bulanan).
- Waktu input satu pengukuran singkat (target: < 1 menit).
- Laporan siap tanpa rekap manual.
- Status gizi & deteksi stunting terpantau dari riwayat data.

## 10. Roadmap & Prioritas

1. **Fondasi (selesai):** SPA Vite + Vue 3, kalkulator client-side (TS, valid vs fixture Python), landing + kalkulator, shadcn-vue, deploy Vercel.
2. **Fase 1 (MVP, berjalan):** schema Supabase diadaptasi dari data eksisting + Auth/RLS ketat + CRUD balita & kunjungan (aktif); form kunjungan lengkap + dashboard hub publik (selesai); peran admin (admin tulis, user biasa read-only) + redirect konfirmasi email produksi (selesai); menyusul: UI bumil.
3. **Fase 2:** dashboard, grafik tumbuh kembang, pemantauan stunting, laporan & ekspor.
4. **Fase 3:** jadwal & pengingat, peran lanjutan, perluasan multi-posyandu.

## 11. Risiko & Asumsi

- **Kesalahan input ganda/ganda data:** mitigasi dengan validasi form dan pencarian duplikat.
- **Kesediaan kader menginput manual:** desain alur sesederhana mungkin.
- **Privasi data anak:** perlu autentikasi sebelum data tersedia publik.
- **Perubahan regulasi/standar:** klasifikasi gizi mengikuti standar terkini.
- **Asumsi:** data diinput dari Buku KMS manual; satu posyandu pada MVP.

## 12. Pertanyaan Terbuka

- Nama final produk (sementara: PosyanduGizi; brand UI & repo: **Posyandu Wapalo** — Wapalo adalah nama desa tempat posyandu). Tagline "Sehat" & "Mandiri" tidak lagi dianimasikan (animasi ketik dihapus).
- Format laporan yang dibutuhkan puskesmas (kolom/bentuk rekap).
- Daftar imunisasi & vitamin standar yang dicatat.
- Cakupan wilayah/desa yang perlu direpresentasikan.
