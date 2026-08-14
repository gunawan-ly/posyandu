-- peran_admin: peran user (admin vs user biasa) + batasi tulis hanya untuk admin

-- 1. tabel peran user (email sebagai kunci, seeded terpisah via db query)
create table if not exists public.user_peran (
  email text primary key,
  peran text not null check (peran in ('admin', 'petugas')),
  created_at timestamptz not null default now()
);

alter table public.user_peran enable row level security;

drop policy if exists "user_peran_baca" on public.user_peran;
create policy "user_peran_baca" on public.user_peran
  for select to authenticated using (true);

-- 2. fungsi cek admin (SECURITY DEFINER agar tidak terhalang RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_peran
    where email = auth.email() and peran = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- 3. balita_identitas: SELECT semua authenticated; tulis hanya admin
drop policy if exists "kader_tambah_balita" on public.balita_identitas;
drop policy if exists "kader_ubah_balita" on public.balita_identitas;
drop policy if exists "kader_hapus_balita" on public.balita_identitas;

create policy "admin_tambah_balita" on public.balita_identitas
  for insert to authenticated with check (public.is_admin() and dibuat_oleh = auth.uid());
create policy "admin_ubah_balita" on public.balita_identitas
  for update to authenticated using (public.is_admin());
create policy "admin_hapus_balita" on public.balita_identitas
  for delete to authenticated using (public.is_admin());

-- 4. balita_kunjungan: SELECT semua authenticated; tulis hanya admin
drop policy if exists "kader_tambah_kunjungan" on public.balita_kunjungan;
drop policy if exists "kader_ubah_kunjungan" on public.balita_kunjungan;
drop policy if exists "kader_hapus_kunjungan" on public.balita_kunjungan;

create policy "admin_tambah_kunjungan" on public.balita_kunjungan
  for insert to authenticated with check (public.is_admin() and dibuat_oleh = auth.uid());
create policy "admin_ubah_kunjungan" on public.balita_kunjungan
  for update to authenticated using (public.is_admin());
create policy "admin_hapus_kunjungan" on public.balita_kunjungan
  for delete to authenticated using (public.is_admin());