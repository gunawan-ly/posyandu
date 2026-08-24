# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sumber Kebenaran

- **AGENTS.md** — panduan agent rinci (struktur per-file, klasifikasi status lengkap, masalah dikenal, alur kolaborasi tim). Baca bila butuh detail yang tidak ada di sini.
- **PRD.md** — living document produk (roadmap fase + changelog batch v2.x).
- Aturan repo: setiap perubahan perilaku aplikasi → **perbarui PRD.md dan AGENTS.md** agar tetap sinkron dengan kode.

## Perintah

```bash
npm run dev        # dev server (port 5173, strictPort)
npm run build      # vue-tsc typecheck + vite build → dist/
npm test           # vitest run (baseline ~91 tes hijau)
npm run lint       # eslint — wajib bersih sebelum commit
```

- Uji sebagian: `npx vitest run src/lib/kalkulator` (folder) atau `npx vitest run src/lib/status.test.ts` (file tunggal).
- Saat mengubah kalkulator: jalankan `npm test` — validasi vs fixture output Python (`src/lib/kalkulator/__fixtures__/expected.json`, toleransi z ±0.005).
- Supabase: migrasi di `supabase/migrations/`; terapkan via `npx supabase db push` (butuh password DB) atau SQL Editor dashboard.
- Deploy GitHub Pages: `npm run build -- --base=/posyandu/` lalu push `main` → workflow `.github/workflows/deploy-pages.yml` otomatis deploy; deep-link ditangani `public/404.html`. Target final: Vercel (`vercel.json` SPA rewrite sudah siap).
- Alias import: `@` → `src`.
- Graphify: untuk pertanyaan codebase, mulai dari `graphify query "<soal>"`; setelah mengubah kode, `graphify update .` (aturan lengkap di AGENTS.md §graphify).

## Arsitektur

Aplikasi web Posyandu (kalkulator status gizi anak WHO metode LMS + pencatatan kunjungan). Bahasa Indonesia untuk kode, komentar, UI, dan commit.

**SPA Vite + Vue 3 + TypeScript — seluruh perhitungan client-side** (port TS dari kalkulator Python). Jangan pindahkan perhitungan ke server tanpa alasan. Backend: Supabase (PostgreSQL + Auth + RLS ketat).

Alur data: `views` → `src/modules/<modul>/db.ts` (service CRUD) → Supabase.

### Struktur per-modul

Tiap modul punya shape sama: `src/modules/<modul>/{views/, db.ts, routes.ts}`. Modul aktif: `balita` & `bumil`; modul `apras` baru **kerangka** (routing + halaman placeholder; struktur tabel menyusul). Modul lain (dewasa & lansia) menyalin shape ini dan didaftarkan lewat spread `...<modul>Routes` di `src/router/index.ts` — **jangan** menaruh service/views modul baru di `src/views/` atau file `db.ts` app-level.

Router: guard `requiresAuth` / `requiresAdmin` via route meta di `beforeEach`; lazy-load semua rute; fallback `*` → `/`.

### Kalkulator & status gizi

- `src/lib/kalkulator/index.ts` — `hitungSemuaStatus()` → z-score + status BB/U · TB/U · BB/TB; plus LiKA/LiLA.
- `src/lib/kalkulator/tabel.ts` — data WHO hasil konversi CSV, **dihasilkan dari `refrences/*.csv` — jangan edit manual** (nama folder memang `refrences`, bukan typo baru).
- Status disimpan ke DB sebagai **label Indonesia** (mis. `Normal`, `Pendek`, `Gizi Buruk`), bukan kode pendek; pemetaan kode↔label (termasuk varian data lama) di `src/lib/status.ts`.
- Modul bumil: **tidak ada z-score WHO untuk kehamilan** → status (BB sesuai kurva KIA, LiLA, TD) disimpan sebagai pilihan manual dari konstanta `OPSI_*`.

### Rekap balita

Logika murni (tanpa Supabase, diuji unit): `src/modules/balita/rekap.ts` + `ekspor.ts`. Aturan rekap baku: nilai kosong/tak diisi **tidak masuk hitungan** kedua kolom; nilai terisi selain Ya/Normal → "Tidak"/"Tidak Normal". `BARIS_RINGKASAN` di `ekspor.ts` adalah satu sumber pasangan label+ambil untuk sheet Excel & tabel UI.

### Fungsi DB publik

- `statistik_publik()` — SECURITY DEFINER, hanya COUNT agregat (tanpa data perorangan); dipakai landing anon.
- `kunjungan_terakhir()` — security invoker (RLS tetap berlaku); filter "perlu perhatian" dilakukan di client (`balitaPerluPerhatian()`).

### Auth & peran

`src/supabase/useAuth.ts` (composable session/masuk/keluar); peran admin via `rpc('is_admin')` + tabel `user_peran`. Anon hanya bisa landing, kalkulator & `/dashboard` (hub publik); `/balita*`, `/bumil*` butuh login; hanya admin bisa tulis/edit/hapus (RLS + gating UI). **Pendaftaran mandiri sudah dihapus** — akun dibuat pengelola langsung di database.

Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL` (templat `.env.example`; `.env` gitignored). Klien Supabase aktif hanya bila env terisi (`wajibSupabase()` di `src/supabase/client.ts`).

## Konvensi Keras

- Commit: `(Update vX.Y.Z) Deskripsi singkat`. **Push ke remote hanya atas instruksi eksplisit dari Awan.**
- Tema: token warna hijau klinis di `src/style.css` — jangan hardcode warna. `--primary` = `#047857` jangan digelapkan/diterangkan lagi.
- Input form memakai konstanta `klsInput` (`h-12 md:h-10` — target sentuh mobile).
- Komponen `CardContent` tidak merender flex/grid → `gap-*` langsung di class-nya tidak bekerja; pakai `CardContent class="flex flex-col gap-N"`.
- Komponen UI baru: primitif shadcn-vue di `src/components/ui/` bila ada. Registry shadcn-vue tak terjangkau dari environment ini — komponen disalin manual dari repo `unovue/shadcn-vue` (branch `dev`, registry `new-york-v4`).
- Dependensi baru ikuti versi mayor eksisting (vue-router v5, vite 8, tailwindcss 4).
- Bug & perilaku khusus remote Supabase (token auth NULL, email confirmation ON remote vs OFF lokal, seed akun kader): lihat AGENTS.md §"Masalah Dikenal".
