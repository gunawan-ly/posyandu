-- statistik_publik v2: angka agregat untuk landing page — dipecah per sasaran & kunjungan bulan berjalan.
-- Perubahan (v2.10.0):
--   - total_balita  -> balita_bayi (< 12 bulan) + balita_balita (>= 12 bulan), konsisten dengan klasifikasiSasaran rekap
--   - total_bumil   -> bumil_hamil + bumil_menyusui (dari kolom kategori)
--   - kunjungan_bulan_ini -> per modul: kunjungan_balita_bulan_ini (distinct balita_id) & kunjungan_bumil_bulan_ini (distinct bumil_id)
--   - total_kunjungan (all-time) DIGANTI kunjungan_bulan_ini (semua baris kunjungan kedua modul pada bulan berjalan)
--   - bulan_ini tetap

-- Fungsi SECURITY DEFINER agar dapat membaca tabel yang di-RLS ketat (anonim tidak punya SELECT).
-- Hanya mengembalikan jumlah (count), bukan baris data — privasi anak terjaga.
create or replace function public.statistik_publik()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'balita_bayi', (
      select count(*) from public.balita_identitas
      where tanggal_lahir is not null
        and age(current_date, tanggal_lahir) < interval '12 months'
    ),
    'balita_balita', (
      select count(*) from public.balita_identitas
      where tanggal_lahir is null
         or age(current_date, tanggal_lahir) >= interval '12 months'
    ),
    'bumil_hamil', (
      select count(*) from public.bumil_identitas
      where lower(coalesce(kategori, '')) like '%hamil%'
    ),
    'bumil_menyusui', (
      select count(*) from public.bumil_identitas
      where lower(coalesce(kategori, '')) like '%menyusui%'
    ),
    'kunjungan_balita_bulan_ini', (
      select count(distinct balita_id) from public.balita_kunjungan
      where balita_id is not null
        and tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ),
    'kunjungan_bumil_bulan_ini', (
      select count(distinct bumil_id) from public.bumil_kunjungan
      where bumil_id is not null
        and tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ),
    'kunjungan_bulan_ini', (
      select count(*) from public.balita_kunjungan
      where tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ) + (
      select count(*) from public.bumil_kunjungan
      where tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ),
    'bulan_ini', to_char(current_date, 'YYYY-MM')
  );
$$;

-- Hanya via fungsi ini, tidak lewat SELECT langsung
revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik() to anon, authenticated;