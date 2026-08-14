# PRD — Sistem Informasi Posyandu (PosyanduGizi)

Dokumen ini adalah **living document**: terus diperbarui seiring perkembangan project.
Status terakhir: **Fondasi selesai** (SPA + kalkulator client-side) — lanjut ke **Fase 1 (MVP) — Pencatatan**.

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

## 4. Ruang Lingkup

- Satu unit posyandu (struktur data disiapkan agar dapat diperluas ke banyak posyandu).
- Kalkulator tanpa autentikasi; autentikasi + RLS diterapkan sejak awal saat fitur data (Fase 1) diaktifkan.
- Input data secara manual dari Buku KMS/formulir posyandu.
- Data sensitif anak tetap diperlakukan sebagai data pribadi (RLS + kendali akses).

## 5. Fitur & Persyaratan

### Fase 1 (MVP) — Pencatatan
- Supabase Auth + RLS (data sensitif dilindungi sejak awal).
- CRUD data balita: nama, jenis kelamin, tanggal lahir, nama orang tua, alamat/kontak.
- Pencatatan kunjungan & pengukuran: berat badan, panjang/tinggi badan, lingkar
  lengan, lingkar kepala, checklist perkembangan; status gizi dihitung otomatis
  di browser (metode LMS WHO: BB/U, TB/U, BB/TB) lalu disimpan.
- Pencatatan imunisasi & vitamin: jenis, dosis, tanggal pemberian.
- Daftar balita dan halaman detail dengan riwayat pengukuran.
- Halaman kalkulator tetap tersedia untuk hitung cepat tanpa menyimpan.

### Fase 2 — Analisis
- Dashboard & statistik: jumlah balita, distribusi status gizi, cakupan kunjungan.
- Grafik tumbuh kembang: kurva BB/U, TB/U, BB/TB terhadap referensi WHO.
- Pemantauan stunting: daftar balita berstatus SP/P dan filter berdasarkan status.
- Rekap laporan & ekspor (Excel/PDF) untuk laporan posyandu & puskesmas.

### Fase 3 — Operasional & Lanjutan
- Jadwal posyandu dan pengingat kunjungan balita.
- Login & autentikasi berbasis peran.
- (Potensi) dukungan banyak posyandu dan integrasi e-PPGBM.

## 6. Model Data

Schema **Supabase (PostgreSQL)** dengan **Row Level Security** sejak awal.

- **`balita`**: id (uuid), nama, jenis_kelamin, tanggal_lahir, nama_orang_tua, alamat/kontak, posyandu_id, dibuat_oleh (FK ke auth.users), created_at.
- **`pengukuran`**: id, balita_id (FK), waktu_kunjungan, umur_bulan (tersimpan untuk audit), berat_badan, panjang_badan, lingkar_lengan, lingkar_kepala, checklist_perkembangan, status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, created_at. Skor-z dihitung client-side (kalkulator TS) lalu disimpan.
- **`imunisasi`** & **`vitamin`** (Fase 1): id, balita_id, jenis, dosis, tanggal_pemberian.
- **`posyandu`** (Fase 3): untuk skala multi-posyandu.
- **RLS:** pemilik data (kader yang mencatat) + role admin dapat mengakses; publik tidak dapat menulis. Env var Supabase: `VITE_SUPABASE_URL` & `VITE_SUPABASE_ANON_KEY` (anon key publik, proteksi lewat RLS).

## 7. Teknologi

- Frontend: **Vue 3 SPA + TypeScript + Vite 8**, Vue Router (lazy), Tailwind CSS v4, shadcn-vue, `@lucide/vue` icons
- Perhitungan: **TypeScript client-side** (metode LMS WHO, z-score) di `src/lib/kalkulator/` — port dari kalkulator Python lama, tervalidasi vs fixture Python
- Database & Auth: **Supabase** (PostgreSQL + Auth/RLS) via `@supabase/supabase-js`
- Deploy: **Vercel** (static SPA; `vercel.json` rewrite untuk deep-link)

## 8. Non-Fungsional

- Responsif: nyaman dipakai di ponsel kader di lapangan.
- Cepat: muat dan input data tanpa hambatan berarti.
- Mudah digunakan oleh pengguna non-teknis (kader).
- Bahasa Indonesia konsisten di seluruh UI.
- Keamanan & privasi data anak diperlakukan serius; tanpa autentikasi pada MVP,
  perlu mitigasi sebelum data publik.

## 9. Metrik Keberhasilan

- Balita dan kunjungan tercatat secara rutin (target: sesuai jadwal posyandu bulanan).
- Waktu input satu pengukuran singkat (target: < 1 menit).
- Laporan siap tanpa rekap manual.
- Status gizi & deteksi stunting terpantau dari riwayat data.

## 10. Roadmap & Prioritas

1. **Fondasi (selesai):** SPA Vite + Vue 3, kalkulator client-side (TS, valid vs fixture Python), landing + kalkulator, shadcn-vue, deploy Vercel.
2. **Fase 1 (MVP):** schema Supabase + Auth/RLS, CRUD balita & pengukuran, imunisasi & vitamin, daftar & detail balita (sedang dikerjakan).
3. **Fase 2:** dashboard, grafik tumbuh kembang, pemantauan stunting, laporan & ekspor.
4. **Fase 3:** jadwal & pengingat, peran lanjutan, perluasan multi-posyandu.

## 11. Risiko & Asumsi

- **Kesalahan input ganda/ganda data:** mitigasi dengan validasi form dan pencarian duplikat.
- **Kesediaan kader menginput manual:** desain alur sesederhana mungkin.
- **Privasi data anak:** perlu autentikasi sebelum data tersedia publik.
- **Perubahan regulasi/standar:** klasifikasi gizi mengikuti standar terkini.
- **Asumsi:** data diinput dari Buku KMS manual; satu posyandu pada MVP.

## 12. Pertanyaan Terbuka

- Nama final produk (sementara: PosyanduGizi).
- Format laporan yang dibutuhkan puskesmas (kolom/bentuk rekap).
- Daftar imunisasi & vitamin standar yang dicatat.
- Cakupan wilayah/desa yang perlu direpresentasikan.
