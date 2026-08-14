-- audit_status: audit dibuat_oleh + kolom status terhitung (additif)

-- 1. trigger isi dibuat_oleh otomatis dari sesi login
create or replace function public.set_dibuat_oleh()
returns trigger
language plpgsql
as $$
begin
  new.dibuat_oleh = coalesce(new.dibuat_oleh, auth.uid());
  return new;
end;
$$;

-- 2. balita_identitas
alter table public.balita_identitas
  add column if not exists dibuat_oleh uuid references auth.users (id);

create trigger trg_balita_identitas_dibuat_oleh
  before insert on public.balita_identitas
  for each row execute function public.set_dibuat_oleh();

-- 3. balita_kunjungan: audit + hasil kalkulator tersimpan
alter table public.balita_kunjungan
  add column if not exists dibuat_oleh uuid references auth.users (id);

create trigger trg_balita_kunjungan_dibuat_oleh
  before insert on public.balita_kunjungan
  for each row execute function public.set_dibuat_oleh();

alter table public.balita_kunjungan
  add column if not exists umur_bulan integer,
  add column if not exists z_bb_u numeric(6,2),
  add column if not exists z_tb_u numeric(6,2),
  add column if not exists z_bb_tb numeric(6,2);
