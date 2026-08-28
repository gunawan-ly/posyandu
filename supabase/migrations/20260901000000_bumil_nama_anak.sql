-- Bumil: tambah kolom nama_anak di identitas untuk memperjelas anak saat kategori Menyusui.
alter table public.bumil_identitas add column if not exists nama_anak text;
