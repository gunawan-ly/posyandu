-- v2.40.1: Penyesuaian kolom kunjungan remaja.
--   - Hapus kolom `status_gizi` (status kini digabung ke nilai `imt`, mis. "19 (N)").
--   - Ubah `imt` dari `numeric` menjadi `text` agar bisa menampung "19 (N)".
-- Idempotent: aman dijalankan ulang (replikasi fresh / re-run).

alter table public.remaja_kunjungan drop column if exists status_gizi;

-- Ubah tipe imt numeric -> text bila masih bertipe numeric (idempotent via do block).
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'remaja_kunjungan'
      and column_name = 'imt'
      and data_type = 'numeric'
  ) then
    alter table public.remaja_kunjungan alter column imt type text using imt::text;
  end if;
end $$;
