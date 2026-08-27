-- Tambah kolom sakit & dirujuk ke kunjungan balita (v2.35.0)
-- Idempotent: aman dijalankan ulang.

ALTER TABLE balita_kunjungan
  ADD COLUMN IF NOT EXISTS sakit text,
  ADD COLUMN IF NOT EXISTS dirujuk text;
