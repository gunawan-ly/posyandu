-- sesuaikan_apras: penyederhanaan modul Apras hasil masukan pengguna (v2.17.0).
-- 1. apras_identitas  : drop bb_lahir & pb_lahir (tidak relevan untuk apras).
-- 2. apras_kunjungan  : drop imunisasi & mt_pangan_lokal (dihapus dari alur pencatatan).
-- nik_orang_tua sudah ada sejak migrasi awal — tidak diubah.
-- Idempotent: gunakan IF EXISTS agar aman re-run & replikasi fresh.

alter table public.apras_identitas
  drop column if exists bb_lahir,
  drop column if exists pb_lahir;

alter table public.apras_kunjungan
  drop column if exists imunisasi,
  drop column if exists mt_pangan_lokal;
