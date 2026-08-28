-- hapus_posyandu_remaja: kolom kategori Posyandu tidak dipakai di modul Remaja.
-- Diputuskan setelah tabel `remaja_identitas` diterapkan — kolom di-drop via alter
-- agar remote & replikasi fresh konsisten dengan UI yang tidak lagi menyediakannya.
-- Idempotent: drop column if exists.

alter table public.remaja_identitas drop column if exists posyandu;
