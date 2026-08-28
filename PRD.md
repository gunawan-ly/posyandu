# PRD — Sistem Informasi Posyandu Wapalo

Dokumen ini adalah **living document**: terus diperbarui seiring perkembangan project.
Status terakhir: **Fase 1 (MVP) — Pencatatan berjalan** (Auth + RLS + CRUD balita, bumil, apras & remaja aktif di Supabase; form kunjungan lengkap + rekap bulanan/tahunan + dashboard hub publik sudah jalan). Terakhir: **Batch v2.39.0 (Modul Remaja: identitas + CRUD)** — modul Remaja (7–18 th) naik dari placeholder jadi modul aktif **fase 1** (identitas + CRUD): tabel `remaja_identitas` (kolom sama balita/apras minus `bb_lahir`/`pb_lahir`/`sasaran`/`posyandu`/`anak_ke` + kolom `nama_sekolah`; kolom `posyandu` di-drop v2.39.2 via `20260829000001_hapus_posyandu_remaja.sql`, kolom `anak_ke` di-drop v2.39.3 via `20260829000002_hapus_anak_ke_remaja.sql`) + RLS kader baca / admin tulis + trigger `set_dibuat_oleh()` (migrasi `20260829000000_modul_remaja.sql` **sudah diterapkan ke remote** via Management API, terekam di `schema_migrations`); lapisan data `listRemaja`/`ambilRemaja`/`buatRemaja`/`ubahRemaja`/`hapusRemaja` di `src/modules/remaja/db.ts`; `RemajaListView` (daftar + cari nama/ortu/NIK + modal tambah/ubah via `FormModalRemaja`, tautan `/remaja?tambah=1`) & `RemajaDetailView` (identitas + tombol Ubah/Hapus); routing `/remaja/:id` detail aktif, `/remaja/baru` & `/remaja/:id/edit` redirect ke daftar; nav Landing/Dashboard & teks pengantar diperbarui (Remaja aktif, hanya Dewasa & Lansia "Segera"); test render 161 hijau. Tanpa kunjungan/rekap/z-score (menyusul). Sebelumnya: **Batch v2.38.x (Bumil kategori rekap pindah ke kunjungan)** — sumber kategori Rekap Tahunan Bumil kini historis per kunjungan (`bumil_kunjungan.kategori`), bukan identitas; migrasi `balita_sakit_dirujuk` (kolom sakit/dirujuk di kunjungan balita) & `bumil_kategori_di_kunjungan` diterapkan ke remote; sinkronisasi lapisan data + test (161 hijau); dokumentasi accepted-risk `xlsx` (lihat §Masalah Dikenal). Sebelumnya: **Batch v2.37.0 (konsistensi UI rekap)** & **v2.36.0 (Rekap Balita freeze pane + Bulan & Tahun + rekapan bulanan Bumil + Nifas)**. Sebelumnya: **Batch v2.35.x (Rekap Tahunan Balita)** — refactor view total, ekspor via `GRUP_KOLOM`, form kunjungan tambah sakit/dirujuk/MT Pangan Lokal. Sebelumnya: **Batch v2.34.x (InputSegmen)** — semua `<select>` form kunjungan & modal identitas diganti toggle segmen (2 opsi). Sebelumnya: **Batch v2.33.x (composables)** — `useStatistikPublik`/`useDaftarModul`, RLS admin apras. Sebelumnya: **Batch v2.32.0 (Rekap gabungan Balita+Apras)** — angka Rekap Bulanan Balita kini mencakup kunjungan anak Apras (dilebur ke keranjang sasaran Balita berdasarkan umur, tanpa kolom baru); tabel rincian per anak memuat kedua modul dengan penanda kolom **Modul** (status gizi kosong utk Apras — tanpa z-score); dedup satu-suara-per-anak lintas modul memakai kunci `"modul:id"`; kolom Modul ikut diekspor ke Excel/CSV. Sebelumnya: **Batch v2.31.x** — Rekap Tahunan Bumil/Busui format resmi puskesmas (baris 12 bulan × indikator bergrup + Ekspor Excel/CSV/Cetak); Posyandu jadi toggle Coklat 1/Coklat 2/Luar Daerah; CI gate lint+test sebelum deploy; escape wildcard pencarian; validasi redirect login; hapus kolom Anak ke di tabel Apras; aksi Ubah mode tabel jadi ikon pensil. Konvensi versi: patch utk perubahan kecil, minor utk fitur. Sebelumnya: **Batch v2.29.0** — Statistik Posyandu di Landing disinkronkan dengan Dashboard (kartu Apras & Kunjungan Apras). Sebelumnya: **Batch v2.24.0–v2.27.0 (kesiapan lapangan)** — pesan galat berbahasa Indonesia di lapisan data & auth (`lib/galat.ts`); **edit kunjungan** di semua modul (Balita/Bumil/Apras) via Dialog dengan penghitungan ulang status; **penilaian otomatis BB naik/tidak berdasarkan tabel KBM per usia** (`lib/kbm.ts`: nilai tetap 1–6 bulan, prorata 300 g/bulan untuk 7–11 bulan & 200 g/bulan untuk ≥12 bulan, fallback >60 bulan — pilihan kader tetap bisa override manual); **PWA installable + antrean offline** (`vite-plugin-pwa`; app shell ter-precache tanpa cache API Supabase; kunjungan yang disimpan saat offline masuk antrean FIFO di localStorage sebagai input mentah dan terkirim otomatis saat online via `lib/offlineAntre.ts` + banner global `AntreBanner.vue`). Sebelumnya: **Batch v2.15.0 (kerangka modul Apras)** — modul **Apras (Anak Pra Sekolah, usia 5–6 tahun / >60 s.d. <72 bulan)** dimulai sebagai kerangka: rute `/apras` (butuh login) + `/apras/baru` (butuh admin, sementara menampilkan halaman placeholder), `/apras/:id` & `/apras/:id/edit` dialihkan ke daftar; halaman `AprasListView` berupa placeholder informatif (kartu glassmorphism + empty-state); kartu navigasi **"Apras"** kini aktif di Dashboard, Landing Layanan, dan Landing Hero (posisi setelah Bayi & Balita), menggantikan entri "Remaja"; **Dewasa & Lansia tetap terkunci**. Struktur tabel/database Apras serta rekap gabungan Bayi/Balita/Apras disusun pada batch berikutnya. Sebelumnya: **Batch v2.14.4 (lazy-load SheetJS)** — pustaka `xlsx` (~350 KB) tidak lagi dibundel ke chunk halaman Rekap (358 KB → 82 KB); kini dimuat lewat **impor dinamis** hanya saat pengguna menekan "Ekspor Excel"/"Salin CSV" (`buatWorkbookRekap` & `teksCsvRekap` menjadi async). Halaman rekap terbuka lebih ringan, terutama di jaringan lambat. Sebelumnya: **Batch v2.14.0 (akses kader tertutup & navigasi cerdas)** — pendaftaran mandiri dihapus dari halaman login (data posyandu hanya untuk kader terdaftar; akun dibuat pengelola via database — seed `posyandu@wapalo.com` peran user biasa/read-only), tombol **"Masuk"** di hero kini **cerdas sesi**: pengunjung yang sudah login langsung dibawa ke dashboard, yang belum ke halaman login. Sebelumnya: **Batch v2.13.0 (landing hero untuk orang awam)** — CTA hero dirancang ulang agar mudah dipakai warga non-teknis: tombol utama **"Masuk"** di posisi atas tengah, lalu **navigasi 4 modul posyandu** (Bumil & Busui, Bayi & Balita aktif; Remaja serta Dewasa & Lansia tampil dengan ikon gembok dan menampilkan pengingat "masih dalam tahap pengembangan" saat diklik). Tombol lama "Mulai Sekarang" & "Coba Kalkulator Status Gizi" dihapus dari hero (kalkulator tetap tersedia lewat menu & seksi kalkulator kilat). Sebelumnya: **Batch v2.12.2 (aturan rekap baku: kosong tidak dihitung)** — aturan tiga-keadaan diperluas ke **semua** kolom rekap (layanan Ya/Tidak, ceklis, status Normal/Tidak Normal): nilai terisi yang bukan Ya/Normal ditulis "Tidak"/"Tidak Normal", sedangkan kunjungan tanpa isi **tidak masuk hitungan** kedua kolom. Sebelumnya: **Batch v2.12.1 (perbaikan logika BB Naik pada rekap)** — kolom **Berat Badan Naik/Tidak Naik** kini tiga-keadaan: kunjungan yang tidak mengisi nilai **tidak dihitung** sama sekali (tidak diasumsikan Tidak Naik); nilai dikenali dari form baru (`Naik`/`Tidak Naik`) maupun data lama (`Y`/`T`). Sebelumnya: **Batch v2.12.0 (rekap: kehadiran balita + responsif mobile)** — tabel Rekap Bulanan Format Resmi kini memuat baris **Balita Datang (Hadir)** & **Balita Tidak Datang (Tidak Hadir)** setelah baris Bayi (satu sumber `BARIS_RINGKASAN` untuk UI & sheet Excel), dan tidak lagi memakai scroll horizontal di tampilan mobile. Sebelumnya: **Batch v2.10.0 (polish & pemecahan statistik)** — (1) statistik landing/dashboard **dipecah per sasaran**: `statistik_publik()` v2 mengembalikan `balita_bayi`/`balita_balita` & `bumil_hamil`/`bumil_menyusui`, persentase kunjungan bulan berjalan per modul (Balita & Bumil/Menyusui, dihitung client-side), dan `kunjungan_bulan_ini` menggantikan total all-time; (2) **tema glassmorphism ala iOS** (kartu kaca backdrop-blur, latar blob gradasi, navbar frosted, sudut & bayangan iOS, palet hijau dipertahankan); (3) **navbar**: tab Tentang aktif benar (anchor + IntersectionObserver), brand bold, **dropdown modul Data Balita** (Balita & Bumil); (4) **skeleton loading** di semua halaman fetch + **real-time search** (debounce) di daftar Balita/Bumil; (5) kartu **Identitas lengkap** di halaman detail Balita & Bumil. Sebelumnya: **Rekap Bulanan Balita + Ekspor selesai (v2.9.0)** — halaman `/balita/rekap` dengan filter **Bulanan** (bulan+tahun, default) / **Rentang** (tanggal bebas), kartu ringkasan, tabel **format resmi Rekap Bulanan Posyandu** (sasaran Bayi/Balita, kehadiran, ceklis perkembangan, BB naik/tidak, status Normal/Tidak Normal untuk BB/U·TB/U·BB/TB·LiKA·LiLA, layanan imunisasi/vitamin A/ASI/MP ASI/obat cacing/edukasi Ya/Tidak — satu suara per balita via kunjungan terakhir), tabel rincian per balita (identitas, pengukuran, status, z-score), dan aksi **Ekspor Excel (XLSX via SheetJS)**, **Salin CSV**, **Cetak/PDF** (`window.print` + CSS `@media print`); logika murni di `src/modules/balita/rekap.ts` + `ekspor.ts` (diuji unit). Sebelumnya: **Modul Bumil selesai (UI + data)** — daftar, form baru/edit, detail, dan **form kunjungan antenatal lengkap** (usia kehamilan, BB & sesuai kurva KIA, LiLA + status hijau/merah, tekanan darah, skrining gejala/TBC/TTD/MT KEK/kelas bumil/edukasi/rujuk; field kehamilan disembunyikan saat kategori Menyusui); **tidak ada z-score WHO utk kehamilan** jadi status disimpan manual (konstanta `OPSI_*`); schema `bumil_identitas` & `bumil_kunjungan` di-migrasi dengan FK `bumil_id` (backfill dari `nama`) + RLS ketat (kader read, admin tulis) — modul Bumil kini **aktif** di landing & dashboard. Sebelumnya: **Dashboard di-redesign menjadi hub publik + home kader** — hero sambutan berbeda untuk anon vs kader (anon: CTA login/kalkulator tanpa data perorangan; kader admin: badge Admin + tombol Tambah Balita), statistik bulan berjalan dari `statistik_publik()`, dan seksi baru **"Balita yang perlu perhatian"** untuk kader (kunjungan terakhir berstatus Kurang/Sangat Kurang/Pendek/Sangat Pendek/Gizi Buruk/Gizi Kurang via fungsi `kunjungan_terakhir()` security invoker — anon diblokir 401). Sebelumnya: **landing page didesain ulang menjadi sistem informasi posyandu digital** — hero keseluruhan posyandu dengan motto **"Sehat & mandiri untuk semua"**, seksi **statistik bulan berjalan** dari fungsi publik `statistik_publik()`, seksi **layanan 4 sasaran**, **kalkulator kilat dipindah** jadi seksi tersendiri, dan **font diubah ke IBM Plex Sans** (formal). Sebelumnya: **klasifikasi BB/TB 6 kategori** (GB/GK/GN/RGL/GL/O) & **label BB/U disesuaikan**, lalu **backfill data produksi** dan **fondasi multi-posyandu** (struktur per-modul `src/modules/balita/`). Sebelumnya: **modul antropometri diperluas ke LiKA/LiLA** — status lingkar kepala & lengan dihitung otomatis (z-score WHO `hcfa`/`acfa`), riwayat kunjungan **satu tabel ... [truncated]

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
- ✅ Pencatatan kunjungan & pengukuran lengkap: tanggal, BB, PB, lingkar lengan, lingkar kepala, imunisasi, vitamin A, ASI, MP-ASI, obat cacing, ceklis perkembangan, gejala TBC, edukasi; status gizi dihitung otomatis di browser (metode LMS WHO: BB/U, TB/U, BB/TB + LiKA/LiLA) lalu disimpan.
- ✅ Daftar balita (cari + hapus) dan halaman detail dengan kurva tabs (BB/U · TB/U · BB/TB · LiKA · LiLA) + riwayat kunjungan. Riwayat kini **satu tabel dengan scroll horizontal internal** (min-w tinggi) diurutkan **kronologis naik** (Januari→Desember), kolom nilai diikuti statusnya (BB | Status BB/U | TB | Status TB/U | BB/TB | LiKA | Status LiKA | LiLA | Status LiLA | …), status LiKA/LiLA dihitung otomatis saat form kunjungan diisi, dan umur dihitung otomatis dari tanggal lahir vs tanggal kunjungan (dikosongkan bila tanggal lahir belum ada).
- ✅ Modul **Bumil** (UI + data): daftar & cari, form baru/edit, detail (identitas + riwayat kunjungan tabel scroll horizontal + ringkasan kunjungan terakhir) dan **form kunjungan antenatal lengkap** — usia kehamilan (minggu), BB + "sesuai kurva KIA", LiLA + status hijau/merah, tekanan darah + "sesuai kurva KIA", skrining gejala (batuk terus-menerus, demam >2 minggu, BB tidak naik 2 bulan), kontak TBC, TTD (dapat + konsumsi), MT KEK (diberikan + konsumsi), kelas bumil, edukasi, rujuk. **Tidak ada z-score WHO utk kehamilan** → status disimpan manual (konstanta `OPSI_*`); field khusus kehamilan disembunyikan saat kategori **Menyusui**. Schema `bumil_identitas` & `bumil_kunjungan` dimigrasi: FK `bumil_id` (backfill dari `nama`), identity, index, RLS ketat (kader read / admin tulis, `service_role` all).
- ✅ Halaman kalkulator tetap tersedia untuk hitung cepat tanpa menyimpan. **Kalkulasi live** (tanpa tombol hitung): hasil & kurva otomatis saat data lengkap; validasi per-field on-blur (tanggal lahir/ukur, BB, PB; `aria-describedby` + live region `role="status"`); tabs kurva BB/U · TB/U · BB/TB; peringatan nilai di luar rentang kewajaran (|z| > 5) non-blocking; ringkasan hasil + tombol salin (clipboard).
- ✅ Dashboard hub publik + home kader: hero sambutan beda utk anon vs kader (anon: CTA login/kalkulator tanpa data perorangan; kader: badge Admin + Tambah Balita), statistik bulan berjalan (`statistik_publik()`), seksi **"Balita yang perlu perhatian"** (kunjungan terakhir berstatus Kurang/Sangat Kurang/Pendek/Sangat Pendek/Gizi Buruk/Gizi Kurang via RPC `kunjungan_terakhir()`, anon diblokir), dan menu navigasi modul (Balita, Apras, Bumil, & Remaja aktif; Dewasa & Lansia "Segera").
- ✅ Landing page sistem informasi posyandu digital: hero keseluruhan posyandu + motto "Sehat & mandiri untuk semua", seksi **statistik bulan berjalan** (fungsi `statistik_publik()` — COUNT agregat balita/bumil/kunjungan bulan ini + persentase cakupan; hanya angka, privasi aman), seksi layanan 4 sasaran, kalkulator kilat interaktif, cara pakai, tentang standar WHO & privasi.
- ✅ Peran admin vs user biasa: hanya admin (tabel `user_peran`) yang bisa tulis/edit/hapus (RLS `is_admin()` + gating UI); user biasa read-only. Pendaftaran baru diarahkan ke URL produksi via `emailRedirectTo` (`VITE_APP_URL`).
- ✅ **PWA instalabel + antrean offline** pencatatan kunjungan (Balita/Bumil/Apras): FIFO di `localStorage`, sync otomatis saat online (`lib/offlineAntre.ts` + banner `AntreBanner.vue`). **Limitasi (sengaja):** hanya *tambah* kunjungan yang antri — *edit/hapus* kunjungan wajib online untuk mencegah konflik versi; perluasan antrean operasi direncanakan di fase lanjutan.
- ✅ Modul **Remaja** (`7–18 th`, fase 1 = identitas + CRUD, v2.39.0): daftar & cari, form baru/edit via modal (`FormModalRemaja`), halaman detail identitas + tombol Ubah/Hapus; lapisan data `listRemaja`/`ambilRemaja`/`buatRemaja`/`ubahRemaja`/`hapusRemaja`; tabel `remaja_identitas` (kolom sama balita/apras minus `bb_lahir`/`pb_lahir`/`sasaran`/`posyandu`/`anak_ke` + `nama_sekolah`; `posyandu` di-drop v2.39.2, `anak_ke` di-drop v2.39.3) + RLS kader baca/admin tulis + trigger `set_dibuat_oleh()`; **tanpa kunjungan/rekap/z-score** (standar antropometri & tabel kunjungan remaja menyusul). Modul **Dewasa/Lansia** masih placeholder: rute `/lansia*` terdaftar di router dengan guard `requiresAuth` (tambah butuh `requiresAdmin`); detail/perbarui dialihkan ke daftar; halaman memakai `PlaceholderModul.vue`. Aktivasi pencatatan penuh menyusul.

### Fase 2 — Analisis
- Statistik & rekap: jumlah balita, distribusi status gizi, cakupan kunjungan (hub dashboard sudah ada sebagai navigasi).
- Grafik tumbuh kembang per balita (kurva BB/U, TB/U, BB/TB vs WHO — sudah tersedia di halaman detail, Fase 1).
- ✅ **Rekap bulanan & ekspor (modul Balita, v2.9.0; diperluas v2.12.0)** — halaman `/balita/rekap`: format **Rekap Bulanan Posyandu** resmi (sasaran, kehadiran bayi & balita terpisah — Datang/Tidak Datang, status, layanan; 32 baris kategori) + ekspor **Excel (XLSX)** & **CSV** + **Cetak/PDF**; filter bulanan/rentang; tabel format resmi tanpa scroll horizontal di mobile (kolom wrap alami). Menyusul: rekap modul Bumil.
- Pemantauan stunting: daftar balita berstatus SP/P dan filter berdasarkan status (catatan Awan: penentuan stunting tetap wewenang puskesmas; aplikasi untuk pencatatan & rekap internal).

### Fase 3 — Operasional & Lanjutan
- Jadwal posyandu dan pengingat kunjungan balita.
- Peran lanjutan (admin posyandu vs puskesmas), reset password & pengelolaan akun.
- (Potensi) dukungan banyak posyandu dan integrasi e-PPGBM.

### Modul Antropometri — Klasifikasi Status Gizi Anak (WHO)

Klasifikasi mengikuti **WHO Child Growth Standards (0–60 bulan)** metode **LMS (z-score)**, dihitung
**client-side (TypeScript)** di `src/lib/kalkulator/` — port dari kalkulator Python lama yang tervalidasi
vs fixture Python.

**Data input (dari form balita + form kunjungan):** `jenis_kelamin`, `tanggal_lahir`,
`tanggal_kunjungan` (tanggal pengukuran), `berat_badan`, `panjang/tinggi_badan`, `lingkar_kepala`,
`lingkar_lengan`. Validasi sebelum klasifikasi: jenis kelamin wajib; tanggal lahir wajib valid;
tanggal pengukuran tidak boleh sebelum tanggal lahir; berat > 0; panjang/tinggi > 0; bila data tidak
valid → **tidak diklasifikasi** (error). Umur dihitung otomatis dari tanggal lahir vs tanggal kunjungan
(kalender); bila tanggal lahir kosong, umur & status BB/U·TB/U·BB/TB dikosongkan sampai tanggal lahir
diisi.

**Jenis pengukuran PB vs TB:** dipilih berdasarkan umur — < 24 bulan → panjang badan (PB), ≥ 24 bulan →
tinggi badan (TB) — untuk memilih tabel `lhfa*`/`wfl*` vs `wfh*`. `measurement_type` ("PB"/"TB") eksplisit
**belum disimpan** di DB (kolomnya tidak ada).

**Prinsip perhitungan:**
- Z-score memakai rumus LMS: `l==0 → ln(x/M)/S`; selain itu `((x/M)^l − 1)/(l·S)`.
- Tabel referensi WHO dipisah dari logika klasifikasi (`src/lib/kalkulator/tabel.ts` dari `refrences/*.csv`);
  update standar cukup mengganti data tabel tanpa mengubah fungsi.
- Ketiga indikator (BB/U, TB/U, BB/TB) dihitung **independen** dan **tidak pernah digabung** menjadi satu
  z-score/status. Skor-z mentah dipakai untuk klasifikasi; pembulatan 2 desimal hanya untuk tampilan.
- **Tidak memakai BMI** untuk BB/TB; BB/TB di-lookup berdasarkan panjang/tinggi (baris terdekat), **bukan umur**.
- Tabel laki-laki/perempuan terpisah (`*Boy`/`*Girl`); tabel mingguan `< 13 minggu` tersedia tapi belum dipakai.

**Klasifikasi per indikator (kode → label Indonesia, batas non-overlap):**

| Indikator | Kategori | Batas z-score |
|---|---|---|
| BB/U (wfa) | `SK` Sangat Kurang | < −3 |
| | `K` Kurang | −3 s/d < −2 |
| | `N` Normal | −2 s/d ≤ +1 |
| | `RBL` Risiko Berat Berlebih | > +1 |
| TB/U (lhfa) | `SP` Sangat Pendek | < −3 |
| | `P` Pendek | −3 s/d < −2 |
| | `N` Normal | −2 s/d ≤ +1 |
| | `T` Tinggi | > +1 |
| BB/TB (wfl/wfh) | `GB` Gizi Buruk | < −3 |
| | `GK` Gizi Kurang | −3 s/d < −2 |
| | `GN` Gizi Baik | −2 s/d ≤ +1 |
| | `RGL` Risiko Gizi Lebih | > +1 s/d ≤ +2 |
| | `GL` Gizi Lebih | > +2 s/d ≤ +3 |
| | `O` Obesitas | > +3 |
| LiKA/U (hcfa) | `MS` Mikrosefali | < −2 |
| | `N` Normal | −2 s/d ≤ +2 |
| | `MK` Makrosefali | > +2 |
| LiLA/U (acfa) | `GK` Gizi Kurang | < −2 |
| | `N` Normal | ≥ −2 |

**Pemaknaan indikator (jangan dicampur):**
- `BB/U` = indikator berat; **tidak** dipakai menentukan stunting, wasting, atau obesitas.
- `TB/U` = pertumbuhan linear / stunting; `TB/U < −2` = stunting (`SP` stunting berat, `P` pendek);
  **bukan** "gizi buruk".
- `BB/TB` = wasting / overweight / obesitas; lookup berdasarkan panjang/tinggi.
- `LiKA/U` = MS/MK; `LiLA/U` = GK/N.
- Contoh hasil independen yang sah: BB/U = Normal, TB/U = Pendek, BB/TB = Gizi Baik — ketiganya
  disimpan & ditampilkan terpisah.

**Fungsi (struktur agar mudah dites):** `hitungSemuaStatus(jk, umurBulan, beratBadan, panjangBadan)` →
`{status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, error}`; plus `hitungZLik`/`hitungZLil`
(lingkar kepala/lengan) & `klasifikasiLika`/`klasifikasiLila`. Status disimpan **terpisah per indikator**
sebagai label Indonesia + z-score mentah; hasil tersimpan terpisah dari pengukuran mentah (raw measurement
di kolom `berat_badan`/`tinggi_badan`/`lingkar_*`, hasil di kolom `bb_menurut_umur`/`z_*`/`umur_bulan`).

**Pengujian:** unit test Vitest `src/lib/kalkulator/index.test.ts` (validasi vs fixture Python, 20 kasus,
toleransi z ±0.005) + test `src/lib/status.test.ts` & `src/modules/bumil/bumil.test.ts` (pemetaan kode↔label
status & opsi kunjungan bumil) + test lapisan data `src/modules/{balita,bumil,apras}/db.test.ts` (builder
kunjungan `susunIsiKunjungan`, filter dashboard `balitaPerluPerhatian`, peng-escapan pencarian; klien Supabase
dimock) + smoke test render komponen; boundary klasifikasi BB/TB (6 kategori) &
indikator lain diuji eksplisit (z = ±3.01/±3.00/±2.99/…, data tidak lengkap, umur 0). Baseline saat ini
**161 test hijau** (14 file test; 1 kasus bersyarat bergantung ketersediaan `localStorage` di-skip). Lint
wajib bersih via `npm run lint` (ESLint flat config: typescript-eslint +
eslint-plugin-vue; komponen vendor shadcn-vue diberi pengecualian baku).

## 6. Model Data

Schema **Supabase (PostgreSQL 17)** dengan **Row Level Security**. Diadaptasi dari schema
yang sudah berisi data eksisting (bukan dibuat baru). Semua relasi & audit bersifat *additive*.

- **`balita_identitas`** (eksisting, 62 baris): id (bigint identity), nama, nik, jenis_kelamin
  (`Laki - Laki`/`Perempuan`), tanggal_lahir, tempat_lahir, anak_ke, nama_orang_tua, nik_orang_tua,
  nomor_kk, dusun, alamat, bb_lahir, pb_lahir, posyandu, dibuat_oleh (FK auth.users, trigger → `auth.uid()`), created_at.
- **`balita_kunjungan`** (eksisting, 167 baris): id, **balita_id (FK baru, backfill dari `nama_anak`)**, nama_anak (legacy), tanggal_kunjungan,
  berat_badan, tinggi_badan, lingkar_lengan, lingkar_kepala, status_lingkar_*, ceklis_perkembangan,
  **imunisasi, vitamin_a, asi_eksklusif, mp_asi, obat_cacing, gejala_tbc, edukasi** (kolom per-kunjungan),
  status BB/U–TB/U–BB/TB **disimpan sebagai label Indonesia** (mis. `Normal`, `Kurang`, `Risiko Berat Berlebih`),
  **umur_bulan + z_bb_u/tb_u/bb_tb** (dari kalkulator TS), dibuat_oleh, created_at.
- **`bumil_identitas`** (14 baris) — identitas ibu (nama, NIK, tgl lahir/umur, suami, KK, dusun/alamat, hamil anak ke, jarak anak sebelumnya, tanggal/tempat/cara bersalin, kategori **Hamil/Menyusui**); **`bumil_kunjungan`** — kunjungan antenatal (usia kehamilan minggu, BB + sesuai kurva KIA, LiLA + status hijau/merah, TD + sesuai kurva KIA, skrining gejala/TBC/TTD/MT KEK/kelas bumil/edukasi/rujuk), terhubung lewat FK **`bumil_id`** (backfill dari `nama`). **Tidak ada z-score WHO utk kehamilan** → status disimpan manual (pilihan `OPSI_*`).
- **`rekap_balita`** & **`rekap_bumil`** — rekap bulanan (Fase 2).
- **RLS ketat:** policy `anon_*` dihapus (sebelumnya anon bisa baca semua data anak & INSERT kunjungan);
  kini `authenticated` bisa SELECT semua; INSERT/UPDATE/DELETE **hanya untuk admin** (fungsi
  `public.is_admin()` dari tabel `user_peran(email, peran)`); INSERT mewajibkan `dibuat_oleh = auth.uid()`
  (diisi trigger). Statistik publik landing via fungsi **`public.statistik_publik()`** (SECURITY DEFINER,
  `search_path=public`) yang mengembalikan COUNT agregat saja (total_balita, total_bumil,
  kunjungan_bulan_ini, total_kunjungan, bulan_ini) — `revoke` dari public, `grant execute` ke
  anon/authenticated, sehingga anonim tak bisa membaca baris data tapi tetap dapat angka ringkas.
  Dashboard kader memakai **`public.kunjungan_terakhir()`** (SECURITY INVOKER — RLS tetap berlaku;
  `revoke` public + anon eksplisit, `grant` hanya authenticated) yang mengembalikan kunjungan
  terakhir per balita (nama, tanggal lahir/kunjungan, status BB/U·TB/U·BB/TB) untuk seksi
  "Balita yang perlu perhatian".
  Env var: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (anon key publik, proteksi lewat
  RLS) & `VITE_APP_URL` (redirect konfirmasi email).

## 7. Teknologi

- Frontend: **Vue 3 SPA + TypeScript + Vite 8**, Vue Router (lazy), Tailwind CSS v4, shadcn-vue, `@lucide/vue` icons; font **IBM Plex Sans** (formal, variabel 400–700) dibundel lokal woff2 di `public/fonts/`
- **Struktur per-modul** (`src/modules/<modul>/`): tiap posyandu (balita, bumil, apras, dewasa & lansia) punya folder sendiri berisi `views/` (list/form/detail), `db.ts` (lapisan data modul), dan `routes.ts` (rute + meta guard) yang didaftarkan di router via spread. `src/views/` hanya halaman app-level (landing, dashboard hub, kalkulator, login) — dashboard dipecah ke `src/views/dashboard/` per-seksi; composable lintas-modul di `src/composables/` (`useStatistikPublik`, `useDaftarModul`); helper di `src/lib/` (kalkulator, umur, status, label) dan `src/components/`. Modul baru cukup menyalin shape `src/modules/balita` tanpa mengubah struktur inti.
- Perhitungan: **TypeScript client-side** (metode LMS WHO, z-score) di `src/lib/kalkulator/` — port dari kalkulator Python lama, tervalidasi vs fixture Python
- Database & Auth: **Supabase** (PostgreSQL + Auth/RLS) via `@supabase/supabase-js`
- Deploy: **GitHub Pages** aktif (URL sementara `gunawan-ly.github.io/posyandu`, workflow + `public/404.html` untuk deep-link); **Vercel** sebagai target final (static SPA; `vercel.json` rewrite siap)
- Ekspor rekap: SheetJS `xlsx` 0.18.5 (impor dinamis; **accepted-risk** higiene — lihat §Risiko & Asumsi & AGENTS.md §Masalah Dikenal #14)

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
2. **Fase 1 (MVP, berjalan):** schema Supabase diadaptasi dari data eksisting + Auth/RLS ketat + CRUD balita & kunjungan (aktif); form kunjungan lengkap + dashboard hub publik (selesai); peran admin (admin tulis, user biasa read-only) + redirect konfirmasi email produksi (selesai); **struktur per-modul** (`src/modules/balita/`, `src/modules/bumil/`) sebagai fondasi multi-posyandu (selesai); **landing page sistem informasi posyandu + statistik bulan berjalan + font formal IBM Plex Sans** (selesai); **dashboard redesign: hub publik + home kader + seksi "Balita yang perlu perhatian"** (selesai); **modul Bumil UI + data** (daftar/form/detail + kunjungan antenatal, status manual, RLS ketat, FK `bumil_id`) (selesai); **kerangka modul Apras** (routing + placeholder + kartu nav aktif; struktur tabel & rekap gabungan Bayi/Balita/Apras menyusul) (v2.15.0); **modul Remaja fase 1** (identitas + CRUD, tabel `remaja_identitas` + RLS admin tulis, v2.39.0); **kerangka modul Dewasa/Lansia** (rute placeholder terdaftar — pencatatan penuh menyusul).
3. **Fase 2:** dashboard, grafik tumbuh kembang, pemantauan stunting, laporan & ekspor.
4. **Fase 3:** jadwal & pengingat, peran lanjutan, perluasan multi-posyandu.

## 11. Risiko & Asumsi

- **Kesalahan input ganda/ganda data:** mitigasi dengan validasi form dan pencarian duplikat.
- **Kesediaan kader menginput manual:** desain alur sesederhana mungkin.
- **Privasi data anak:** perlu autentikasi sebelum data tersedia publik.
- **Perubahan regulasi/standar:** klasifikasi gizi mengikuti standar terkini.
- **Asumsi:** data diinput dari Buku KMS manual; satu posyandu pada MVP.
- **Accepted-risk `xlsx` (diputuskan v2.38.8):** npm audit menemukan 1 vuln high (Prototype Pollution + ReDoS) di `xlsx@0.18.5` tanpa fix di npm. Dipertahankan karena pemakaian **write-only** (hanya ekspor data internal, tidak parse berkas user) sehingga tidak praktis dieksploitasi. Remediasi memungkinkan: vendor SheetJS CE patched (0.20+) dari `cdn.sheetjs.com` di mesin yang bisa mengaksesnya, atau migrasi ke `exceljs`; rencana ditunda sampai kebutuhan nyata.

## 12. Pertanyaan Terbuka

- Nama final produk: **Posyandu Wapalo** (diputuskan oleh Awan, sebelumnya sementara memakai nama PosyanduGizi; Wapalo adalah nama desa tempat posyandu). Tagline "Sehat" & "Mandiri" tidak lagi dianimasikan (animasi ketik dihapus).
- Format laporan yang dibutuhkan puskesmas (kolom/bentuk rekap).
- Daftar imunisasi & vitamin standar yang dicatat.
- Cakupan wilayah/desa yang perlu direpresentasikan.
