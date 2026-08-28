-- hapus_anak_ke_remaja: kolom "Anak Ke" tidak dipakai di modul Remaja.
-- Idempotent: drop column if exists (sama pola dengan hapus_posyandu_remaja).

alter table public.remaja_identitas drop column if exists anak_ke;
