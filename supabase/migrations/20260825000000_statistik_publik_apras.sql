-- statistik_publik v3: tambah data Apras (Anak Pra Sekolah, usia 5–6 tahun).
-- Perubahan dari v2 (20260820000000):
--   - tambah key 'apras_total' (count apras_identitas)
--   - tambah key 'kunjungan_apras_bulan_ini' (count distinct apras_id dari apras_kunjungan)
--   - 'kunjungan_bulan_ini' kini = balita + bumil + apras (semua baris kunjungan bulan berjalan)
--   - semua kunci v2 tetap dipertahankan

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
    'apras_total', (
      select count(*) from public.apras_identitas
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
    'kunjungan_apras_bulan_ini', (
      select count(distinct apras_id) from public.apras_kunjungan
      where apras_id is not null
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
    ) + (
      select count(*) from public.apras_kunjungan
      where tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ),
    'bulan_ini', to_char(current_date, 'YYYY-MM')
  );
$$;

-- Hanya via fungsi ini, tidak lewat SELECT langsung
revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik() to anon, authenticated;
