# Tugas: Perbaikan Form Apras + Dusun Button Group + Dewasa & Lansia Aktif

Repo: proyek Posyandu Wapalo (Vue 3 + TS + Vite + Tailwind 4 + shadcn-vue).
Seluruh bahasa Indonesia (kode, komentar, UI). JANGAN commit.

## Latar
- Form Apras (`src/modules/apras/views/AprasFormView.vue`) punya field "Anak ke" yang tidak diminta.
- Field Dusun di semua modul masih input teks bebas; harus jadi button group pilihan (3 opsi).
- Modul Dewasa & Lansia di Landing Hero masih terkunci (ikon gembok).

## Pekerjaan

### 1. Form Apras — Susunan Ulang Field
**File: `src/modules/apras/views/AprasFormView.vue`**

Urutan field di template HARUS jadi persis:
1. Nama Anak *
2. NIK
3. Jenis Kelamin * (button group Laki-laki / Perempuan — sudah ada, jangan diubah)
4. Tanggal Lahir *
5. Tempat Lahir
6. Nama Orang Tua
7. NIK Orang Tua
8. Nomor KK
9. Dusun → button group 3 opsi (lihat task 2)
10. Alamat
11. Posyandu

HAPUS field "Anak ke" sepenuhnya dari:
- `ref()` (baris `const anakKe = ref('')`)
- `isiForm()` assignment (`anakKe.value = a.anak_ke ?? ''`)
- `payload` di `simpan()` (`anak_ke: ...`)
- Template `<div>` yang berisi input "Anak ke"

### 2. Dusun → Button Group 3 Opsi (semua modul)
Ubah field Dusun dari `<input type="text">` menjadi button group persis seperti field Jenis Kelamin:

**3 Opsi:**
- `Kayumas`
- `Tengah`
- `Cempaka`

**Tampilan:** Persis sama dengan button group Jenis Kelamin yang sudah ada — pakai `inline-flex w-full rounded-lg border border-emerald-200 bg-emerald-50 p-1` dengan style aktif `bg-primary text-primary-foreground shadow-sm`.

**Lakukan di 3 file:**
- `src/modules/apras/views/AprasFormView.vue`
- `src/modules/balita/views/BalitaFormView.vue`
- `src/modules/bumil/views/BumilFormView.vue`

Di setiap file:
- Ganti `<input id="dusun" ... type="text" ...>` dengan button group.
- Pastikan `dusun` ref tetap `ref('')` (string biasa — 3 pilihan).
- `payload.dusun` tetap `dusun.value.trim() || null` — tidak perlu diubah.

### 3. Dewasa & Lansia Aktif di Landing Hero
**File: `src/views/landing/LandingHero.vue`**

1. Hapus import `Lock` dari `@lucide/vue`.
2. Ubah entri modul Dewasa & Lansia dari:
   ```
   { nama: 'Dewasa & Lansia', aktif: false }
   ```
   Menjadi:
   ```
   { nama: 'Dewasa & Lansia', aktif: true, href: '/lansia' }
   ```
3. Di template, HAPUS semua rendering `<Lock class="size-4" />` dan `<Lock class="size-3.5" />`.
4. Pastikan card Dewasa & Lansia punya style yang SAMA PERSIS dengan modul lain (tidak ada perbedaan visual).

## Batasan
- JANGAN menyentuh palet/tema.
- JANGAN ubah perilaku field lain selain yang disebut.
- `klsInput` tetap dipakai untuk styling input lain.
- Button group Dusun harus persis sama style-nya dengan button group JK yang sudah ada.
- Ikuti konvensi AGENTS.md (CardContent pakai flex eksplisit, dsb.).

## Definisi selesai
- `npm run lint` bersih
- `npm test` hijau
- `npm run build` sukses
- Bahasa Indonesia konsisten
