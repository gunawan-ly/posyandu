-- Rekap Bumil/Busui (v2.31.0): dua kolom layanan ibu nifas/menyusui yang
-- diminta format rekap resmi puskesmas namun belum ada di bumil_kunjungan:
-- - vitamin_a            : Vitamin A untuk ibu nifas ('Ya'/'Tidak')
-- - kb_pasca_persalinan  : mengikuti KB pasca persalinan ('Ya'/'Tidak')
-- Keduanya hanya relevan saat kategori ibu = Menyusui (nifas).
-- RLS & policy tabel sudah mencakup seluruh kolom — tidak perlu perubahan.
-- Idempotent agar replikasi fresh aman.

alter table public.bumil_kunjungan add column if not exists vitamin_a text;
alter table public.bumil_kunjungan add column if not exists kb_pasca_persalinan text;
