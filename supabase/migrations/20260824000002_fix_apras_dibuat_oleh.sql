-- fix_apras_dibuat_oleh: trigger pengisi otomatis kolom dibuat_oleh untuk apras_identitas.
-- Policy INSERT kader_tambah_apras mewajibkan dibuat_oleh = auth.uid(); tabel balita memakai
-- trigger set_dibuat_oleh() (fungsi shared) untuk mengisinya otomatis — apras sempat terlewat.
-- Idempotent: aman re-run & replikasi fresh.

drop trigger if exists trg_apras_identitas_dibuat_oleh on public.apras_identitas;

create trigger trg_apras_identitas_dibuat_oleh
  before insert on public.apras_identitas
  for each row execute function public.set_dibuat_oleh();
