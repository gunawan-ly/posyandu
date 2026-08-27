-- Pindahkan sumber kebenaran kategori (Hamil/Nifas/Menyusui) untuk REKAPAN
-- ke kunjungan. Identitas KETERAP ada (status saat ini, diisi manual oleh kader,
-- dipakai tampilan & statistik publik), tapi Rekapan kini membaca kategori dari
-- kunjungan agar status historis per bulan akurat (satu ibu bisa Hamil → Nifas →
-- Menyusui dalam satu tahun).

-- 1. tambah kolom kategori di kunjungan (idempotent)
alter table public.bumil_kunjungan
  add column if not exists kategori text;

-- 2. backfill: salin kategori identitas ke SEMUA kunjungan ibu tsb agar rekap
--    historis tidak kehilangan data (approved: identitas kategori = status saat ini)
update public.bumil_kunjungan k
set kategori = b.kategori
from public.bumil_identitas b
where k.bumil_id = b.id
  and (k.kategori is null or k.kategori = '');
