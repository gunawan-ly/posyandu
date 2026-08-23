-- seed_akun_kader: akun kader posyandu@wapalo.com dibuat langsung di database
-- agar tidak lewat pendaftaran mandiri (pendaftaran UI sudah dihapus).
-- PERAN: TIDAK diberi peran admin — user biasa hanya read-only (RLS menegakkan).
--
-- CATATAN PENTING (AGENTS.md #5 & #6):
-- - email confirmation remote ON → kolom email_confirmed_at wajib terisi.
-- - Bug GoAuth: kolom token NULL membuat login gagal ("converting NULL to string")
--   → semua kolom token diisi string kosong '' (bukan NULL).

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_status,
  email_change_confirm_status
)
select
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'posyandu@wapalo.com',
  crypt('Wapalo-Bisa-Olo', gen_salt('bf')),
  now(),
  null,
  '',
  '',
  '',
  '',
  null,
  null,
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  null,
  null,
  0,
  0
where not exists (
  select 1 from auth.users where email = 'posyandu@wapalo.com'
);

-- Pastikan identitas terkait ada (tabel identitas dibuat GoTrue otomatis saat insert via API;
-- untuk insert manual, buat barisnya bila belum ada).
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.email,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true
  ),
  'email',
  now(),
  now(),
  now()
from auth.users u
where u.email = 'posyandu@wapalo.com'
  and not exists (
    select 1 from auth.identities i where i.user_id = u.id and i.provider = 'email'
  );

-- Peran USER BIASA (read-only): sengaja BUKAN admin.
-- Baris ini hanya penanda keanggotaan; RLS tulis tetap menuntut peran 'admin'.
insert into public.user_peran (email, peran)
values ('posyandu@wapalo.com', 'petugas')
on conflict (email) do nothing;
