-- kunci_tulis_admin: pastikan SEMUA tulis (insert/update/delete) di seluruh modul
-- HANYA boleh dilakukan admin; kader (non-admin) read-only.
--
-- Kebijakan (2026-08-28): kader hanya melihat/membaca. Bila kader perlu mengubah
-- data, ia diberi akun dengan peran admin.
--
-- Latar belakang: migrasi lama utk balita (20260814000002/03) & apras
-- (20260824000000/01) membolehkan 'authenticated' menulis lewat policy
-- "kader_tambah/ubah/hapus". Karena policy RLS bersifat OR (aditif), jika policy
-- tsb masih ada, non-admin bisa menulis. Di remote policy tsb sudah tidak ada,
-- tetapi utk menjaga replikasi fresh (db push ulang dari nol) tetap aman, migrasi
-- ini secara eksplisit men-drop-nya (idempotent).
--
-- Policy "kader_baca_*" (SELECT) DI-PERTAHANKAN — itu justru celah read bagi kader.

-- ===== Balita =====
drop policy if exists "kader_tambah_balita" on public.balita_identitas;
drop policy if exists "kader_ubah_balita" on public.balita_identitas;
drop policy if exists "kader_hapus_balita" on public.balita_identitas;

drop policy if exists "kader_tambah_kunjungan" on public.balita_kunjungan;
drop policy if exists "kader_ubah_kunjungan" on public.balita_kunjungan;
drop policy if exists "kader_hapus_kunjungan" on public.balita_kunjungan;

-- ===== Apras =====
drop policy if exists "kader_tambah_apras" on public.apras_identitas;
drop policy if exists "kader_ubah_apras" on public.apras_identitas;
drop policy if exists "kader_hapus_apras" on public.apras_identitas;

drop policy if exists "kader_tambah_apras_kunjungan" on public.apras_kunjungan;
drop policy if exists "kader_ubah_apras_kunjungan" on public.apras_kunjungan;
drop policy if exists "kader_hapus_apras_kunjungan" on public.apras_kunjungan;
