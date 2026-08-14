# AGENTS.md

## Project Overview
Aplikasi web Kalkulator Status Gizi Anak (Posyandu) berbasis standar pertumbuhan WHO
(metode LMS). Bahasa: Indonesia (kode, komentar, dan UI).

## Tech Stack
- Backend: Python Flask + Flask-SQLAlchemy (SQLite di `instance/posyandu.db`)
- Perhitungan: pandas (metode LMS WHO, z-score)
- Frontend: Tailwind CSS v4 (CLI: `@tailwindcss/cli`)
- Python: 3.12+ (dev dgn 3.14)

## Setup & Perintah
- `python -m venv venv && source venv/bin/activate`   # buat & aktifkan venv
- `pip install -r requirements.txt`   # Flask, pandas, flask_sqlalchemy
- `npm install`                        # tailwindcss
- `npx @tailwindcss/cli -i static/input.css -o static/output.css`   # build CSS (tambahkan `--watch` untuk mode pengembangan)
- `python flask_app.py`               # jalankan dev server dari dalam venv (debug=True, port 5000)
- Uji cepat kalkulator tanpa server: `python3 -c "from package.kalkulator_gizi import hitung_semua_status; print(hitung_semua_status('L', 12, 9.6, 75))"`
- Verifikasi sintaks: `python -m py_compile <file.py>`

## Struktur Proyek
- `flask_app.py` — entry point; rute `GET /` (form) & `POST /hitung` (hitung + simpan ke DB); model `Anak` dan `Pengukuran`; `db.create_all()`
- `package/kalkulator_gizi.py` — inti perhitungan: `hitung_semua_status(jk, umur_bulan, berat_badan, panjang_badan)` mengembalikan dict `{status_bb_u, status_tb_u, status_bb_tb, z_bb_u, z_tb_u, z_bb_tb, error}`
- `refrences/` — data WHO (CATATAN: folder ditulis `refrences`, bukan `references`)
- `static/` — Tailwind (`input.css` sumber, `output.css` hasil build)
- `templates/` — `index.html` (form input) & `hasil.html` (tampil hasil)
- `instance/posyandu.db` — database SQLite (dibuat otomatis saat app jalan)

## Data & Klasifikasi Status
- Indikator: BB/U (wfa), TB/U (lhfa), BB/TB (wfl < 24 bln, wfh >= 24 bln)
- BB/U: SK (<-3), K (-3..-2), N (-2..+1), RBL (>+1)
- TB/U: SP, P, N, T (batas sama dgn BB/U)
- BB/TB: GK (<-2), GB (-2..+1), GL (>+1..+3), O (>+3)
- BB/TB dicari berdasarkan panjang/tinggi badan (baris terdekat), bukan umur
- Umur < 24 bulan: tabel lhfa/wfl versi `2_years`; >= 24 bulan: versi `5_years`
- Umur < 13 minggu: tabel mingguan (`*_13_weeks.csv`, kolom `Week`) tersedia tapi belum dipakai
- Catatan: CSV lhfa berisi kolom `M       ` (spasi ekor); sudah ditangani dengan strip nama kolom di `baca_csv`

## Konvensi
- Bahasa Indonesia untuk kode, komentar, dan pesan
- Class status: string pendek seperti `SK`, `K`, `N`, `RBL`, `SP`, `P`, `T`, `GK`, `GB`, `GL`, `O`
- Git commit: `(Update vX.Y.Z) Deskripsi singkat`

## Konvensi Git & Perawatan Repo
- JANGAN commit `__pycache__/`, `*.pyc`, `instance/*.db`; tambahkan ke `.gitignore`
- Jangan memodifikasi file CSV referensi WHO tanpa verifikasi skema kolom
- Setelah menambahkan class Tailwind baru di template, build ulang `static/output.css`

## Masalah Dikenal / Catatan
1. `instance/posyandu.db` dan `__pycache__/` sempat ter-track pada commit lama; perlu `git rm --cached` bila ingin dihapus dari repo
2. Lingkar lengan & kepala hanya disimpan, belum dihitung statusnya
3. `kesimpulan_bb_bulan_lalu` belum diisi (butuh riwayat pengukuran sebelumnya)
4. Tidak ada test otomatis/linter/formatter; jalankan `python -m py_compile` pada file yang diubah
5. Umur < 13 minggu masih dihitung per bulan (tabel mingguan belum dipakai)
