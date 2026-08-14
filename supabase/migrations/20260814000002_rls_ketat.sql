-- rls_ketat: tutup akses anonim, buka untuk kader terautentikasi

-- 1. hapus policy anon yang membuka data anak (privasi)
drop policy if exists "anon_select_balita_identitas" on public.balita_identitas;
drop policy if exists "anon_select_balita_kunjungan" on public.balita_kunjungan;
drop policy if exists "anon_insert_balita_kunjungan" on public.balita_kunjungan;
drop policy if exists "anon_select_bumil_identitas" on public.bumil_identitas;
drop policy if exists "anon_select_bumil_kunjungan" on public.bumil_kunjungan;
drop policy if exists "anon_select_rekap_balita" on public.rekap_balita;

-- 2. policy balita_identitas
drop policy if exists "auth_select_balita_identitas" on public.balita_identitas;
create policy "kader_baca_balita" on public.balita_identitas
  for select to authenticated using (true);
create policy "kader_tambah_balita" on public.balita_identitas
  for insert to authenticated with check (dibuat_oleh = auth.uid());
create policy "kader_ubah_balita" on public.balita_identitas
  for update to authenticated using (true);
create policy "kader_hapus_balita" on public.balita_identitas
  for delete to authenticated using (true);

-- 3. policy balita_kunjungan
drop policy if exists "auth_select_balita_kunjungan" on public.balita_kunjungan;
create policy "kader_baca_kunjungan" on public.balita_kunjungan
  for select to authenticated using (true);
create policy "kader_tambah_kunjungan" on public.balita_kunjungan
  for insert to authenticated with check (dibuat_oleh = auth.uid());
create policy "kader_ubah_kunjungan" on public.balita_kunjungan
  for update to authenticated using (true);
create policy "kader_hapus_kunjungan" on public.balita_kunjungan
  for delete to authenticated using (true);
