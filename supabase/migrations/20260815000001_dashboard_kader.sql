-- dashboard_kader: kunjungan terakhir per balita untuk halaman Dashboard (seksi "Perlu Perhatian")
-- Security INVOKER → RLS tetap berlaku; hanya authenticated yang punya SELECT, jadi data perorangan
-- tidak pernah bocor ke anonim. Anon tidak diberi execute (revoke public).

create or replace function public.kunjungan_terakhir()
returns table (
  balita_id bigint,
  nama text,
  tanggal_lahir date,
  tanggal_kunjungan date,
  bb_menurut_umur text,
  pbtb_menurut_umur text,
  bb_menurut_pbtb text
)
language sql
stable
security invoker
set search_path = public
as $$
  select distinct on (k.balita_id)
    b.id as balita_id,
    b.nama,
    b.tanggal_lahir,
    k.tanggal_kunjungan,
    k.bb_menurut_umur,
    k.pbtb_menurut_umur,
    k.bb_menurut_pbtb
  from public.balita_identitas b
  join public.balita_kunjungan k on k.balita_id = b.id
  order by k.balita_id, k.tanggal_kunjungan desc, k.id desc
$$;

revoke all on function public.kunjungan_terakhir() from public;
revoke all on function public.kunjungan_terakhir() from anon;
grant execute on function public.kunjungan_terakhir() to authenticated;