-- apras_rls_admin: fix trigger dibuat_oleh + upgrade RLS ke admin-only.
-- Bug: apras_kunjungan tidak punya trigger set_dibuat_oleh(), sehingga INSERT selalu
-- gagal (policy check dibuat_oleh = auth.uid() evaluasi NULL = uuid → FALSE).
-- Juga upgrade policy UPDATE/DELETE agar wajib is_admin() seperti Balita/Bumil.

-- 1. Trigger auto-fill dibuat_oleh (idempotent)
drop trigger if exists trg_apras_kunjungan_dibuat_oleh on public.apras_kunjungan;

create trigger trg_apras_kunjungan_dibuat_oleh
  before insert on public.apras_kunjungan
  for each row execute function public.set_dibuat_oleh();

-- 2. Upgrade RLS apras_identitas → admin-only write
drop policy if exists "kader_tambah_apras" on public.apras_identitas;
drop policy if exists "kader_ubah_apras" on public.apras_identitas;
drop policy if exists "kader_hapus_apras" on public.apras_identitas;

create policy "admin_tambah_apras" on public.apras_identitas
  for insert to authenticated
  with check (public.is_admin() and dibuat_oleh = auth.uid());

create policy "admin_ubah_apras" on public.apras_identitas
  for update to authenticated using (public.is_admin());

create policy "admin_hapus_apras" on public.apras_identitas
  for delete to authenticated using (public.is_admin());

-- 3. Upgrade RLS apras_kunjungan → admin-only write
drop policy if exists "kader_tambah_apras_kunjungan" on public.apras_kunjungan;
drop policy if exists "kader_ubah_apras_kunjungan" on public.apras_kunjungan;
drop policy if exists "kader_hapus_apras_kunjungan" on public.apras_kunjungan;

create policy "admin_tambah_apras_kunjungan" on public.apras_kunjungan
  for insert to authenticated
  with check (public.is_admin() and dibuat_oleh = auth.uid());

create policy "admin_ubah_apras_kunjungan" on public.apras_kunjungan
  for update to authenticated using (public.is_admin());

create policy "admin_hapus_apras_kunjungan" on public.apras_kunjungan
  for delete to authenticated using (public.is_admin());
