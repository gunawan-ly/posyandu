-- statistik_publik: angka agregat untuk landing page (aman untuk publik — hanya COUNT, tanpa data perorangan)

-- Fungsi SECURITY DEFINER agar dapat membaca tabel yang di-RLS ketat (anonim tidak punya SELECT)
-- Hanya mengembalikan jumlah (count), bukan baris data — privasi anak terjaga.
create or replace function public.statistik_publik()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'total_balita', (select count(*) from public.balita_identitas),
    'total_bumil', (select count(*) from public.bumil_identitas),
    'kunjungan_bulan_ini', (
      select count(*)
      from public.balita_kunjungan
      where tanggal_kunjungan >= date_trunc('month', current_date)
        and tanggal_kunjungan < date_trunc('month', current_date) + interval '1 month'
    ),
    'total_kunjungan', (select count(*) from public.balita_kunjungan),
    'bulan_ini', to_char(current_date, 'YYYY-MM')
  );
$$;

-- Hanya via fungsi ini, tidak lewat SELECT langsung
revoke all on function public.statistik_publik() from public;
grant execute on function public.statistik_publik() to anon, authenticated;