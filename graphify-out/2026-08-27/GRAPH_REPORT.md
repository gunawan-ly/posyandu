# Graph Report - posyandu  (2026-08-27)

## Corpus Check
- 199 files · ~87,193 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1221 nodes · 1356 edges · 103 communities (80 shown, 23 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `099001b1`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/modules/balita/views/BalitaDetailView.vue
- select/index.ts
- dependencies
- compilerOptions
- sheet/index.ts
- kalkulator/index.ts
- devDependencies
- What You Must Do When Invoked
- KurvaWHO.vue
- FormKunjunganBalita.vue
- balita/db.ts
- src/views/LoginView.vue
- compilerOptions
- PRD — Sistem Informasi Posyandu Wapalo
- Accordion.vue
- card/index.ts
- TooltipContent.vue
- src/views/KalkulatorView.vue
- router/index.ts
- AGENTS.md
- useAuth.ts
- graphify reference: extra exports and benchmark
- LandingHero.vue
- graphify reference: query, path, explain
- AppNavbar.vue
- status.ts
- Badge.vue
- Input.vue
- client.ts
- opencode.json
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- Reveal.vue
- Button.vue
- Label.vue
- Separator.vue
- src/views/DashboardView.vue
- graphify.js
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- StatusBadge.vue
- kbm.ts
- tsconfig.json
- vercel.json
- extraction-spec.md
- views.test.ts
- src/modules/balita/views/BalitaListView.vue
- balita/routes.ts
- src/modules/bumil/views/BumilDetailView.vue
- offlineAntre.ts
- bumil/db.ts
- src/modules/bumil/views/BumilListView.vue
- bumil/routes.ts
- dialog/index.ts
- FormKunjunganBumil.vue
- src/modules/apras/views/AprasDetailView.vue
- balita/ekspor.ts
- FormModalBalita.vue
- FormModalBumil.vue
- src/modules/balita/views/BalitaRekapView.vue
- bumil/ekspor.ts
- FormModalApras.vue
- FormKunjunganApras.vue
- balita/rekap.test.ts
- src/modules/bumil/views/BumilRekapView.vue
- apras/db.ts
- balita/rekap.ts
- Arsitektur
- InputSegmen.vue
- Tugas: Navbar 5 modul + Modul Dewasa & Lansia + Statistik Apras di Beranda
- Tugas: Perbaikan Form Apras + Dusun Button Group + Dewasa & Lansia Aktif
- ConfirmDialog.vue
- useDaftarModul
- label.ts
- DetailKunjunganModal.vue
- useStatistikPublik.ts
- src/modules/apras/views/AprasListView.vue
- apras/routes.ts
- DashboardLayanan.vue
- lansia/routes.ts
- remaja/routes.ts
- ViewToggle.vue
- cari.ts
- DashboardPerhatian.vue
- AntreBanner.vue
- DashboardHero.vue
- DashboardStatistik.vue

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `compilerOptions` - 13 edges
3. `PRD — Sistem Informasi Posyandu Wapalo` - 13 edges
4. `What You Must Do When Invoked` - 12 edges
5. `hitungSemuaStatus()` - 10 edges
6. `hitungRekapBulanan()` - 10 edges
7. `hitungRekapTahunan()` - 10 edges
8. `/graphify` - 10 edges
9. `graphify reference: extra exports and benchmark` - 8 edges
10. `sinkronkan()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `KolomRekap` --references--> `RekapBulanan`  [EXTRACTED]
  src/modules/balita/ekspor.ts → src/modules/balita/rekap.ts
- `BarisRingkasan` --references--> `RekapBulanan`  [EXTRACTED]
  src/modules/balita/ekspor.ts → src/modules/balita/rekap.ts
- `hitung()` --indirect_call--> `gabungAnakBalita()`  [INFERRED]
  src/modules/balita/rekap.test.ts → src/modules/balita/rekap.ts
- `hitung()` --indirect_call--> `gabungKunjunganBalita()`  [INFERRED]
  src/modules/balita/rekap.test.ts → src/modules/balita/rekap.ts
- `hitung()` --calls--> `hitungRekapBulanan()`  [EXTRACTED]
  src/modules/balita/rekap.test.ts → src/modules/balita/rekap.ts

## Import Cycles
- None detected.

## Communities (103 total, 23 thin omitted)

### Community 0 - "src/modules/balita/views/BalitaDetailView.vue"
Cohesion: 0.06
Nodes (29): balita, detailBaris, detailJudul, detailOpen, dlgHapus, editOpen, formatTanggal(), hapusDariTabel() (+21 more)

### Community 1 - "select/index.ts"
Cohesion: 0.05
Nodes (25): emits, forwarded, props, delegatedProps, emits, forwarded, props, props (+17 more)

### Community 2 - "dependencies"
Cohesion: 0.06
Nodes (31): class-variance-authority, clsx, @lucide/vue, dependencies, class-variance-authority, clsx, @lucide/vue, reka-ui (+23 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, ES2022, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions, allowImportingTsExtensions (+20 more)

### Community 4 - "sheet/index.ts"
Cohesion: 0.07
Nodes (18): emits, forwarded, props, props, delegatedProps, emits, forwarded, props (+10 more)

### Community 5 - "kalkulator/index.ts"
Cohesion: 0.12
Nodes (32): bulatkan2(), cariBarisPanjangTerdekat(), cariBarisUmur(), HasilStatusGizi, hitungSemuaStatus(), hitungZLik(), hitungZLil(), hitungZScoreLms() (+24 more)

### Community 6 - "devDependencies"
Cohesion: 0.06
Nodes (35): eslint, eslint-plugin-vue, globals, happy-dom, devDependencies, eslint, eslint-plugin-vue, globals (+27 more)

### Community 7 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 8 - "KurvaWHO.vue"
Cohesion: 0.11
Nodes (23): Baris, dataTitik, gabungLhfa, garisGrid, Indikator, LABEL_KURVA, LABEL_X, nilaiUntukZ() (+15 more)

### Community 9 - "FormKunjunganBalita.vue"
Cohesion: 0.05
Nodes (38): asiEksklusif, bbNaik, bbNaikManual, beratBadan, ceklisPerkembangan, dirujuk, edukasi, emit (+30 more)

### Community 10 - "balita/db.ts"
Cohesion: 0.11
Nodes (12): balitaPerluPerhatian(), InputBalita, InputKunjungan, KODE_BULAN, kodeBulan(), Kunjungan, kunjunganTerakhir, peringkatStatus() (+4 more)

### Community 11 - "src/views/LoginView.vue"
Cohesion: 0.22
Nodes (7): email, { inisialisasi, masuk }, kataSandi, pesanError, route, router, sibuk

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, node, vite.config.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection (+9 more)

### Community 13 - "PRD — Sistem Informasi Posyandu Wapalo"
Cohesion: 0.11
Nodes (17): 10. Roadmap & Prioritas, 11. Risiko & Asumsi, 12. Pertanyaan Terbuka, 1. Ringkasan Produk, 2. Masalah & Peluang, 3. Pengguna & Peran, 4. Ruang Lingkup, 5. Fitur & Persyaratan (+9 more)

### Community 14 - "Accordion.vue"
Cohesion: 0.13
Nodes (10): emits, forwarded, props, delegatedProps, props, delegatedProps, forwardedProps, props (+2 more)

### Community 15 - "card/index.ts"
Cohesion: 0.13
Nodes (7): props, props, props, props, props, props, props

### Community 16 - "TooltipContent.vue"
Cohesion: 0.14
Nodes (9): emits, forwarded, props, delegatedProps, emits, forwarded, props, props (+1 more)

### Community 17 - "src/views/KalkulatorView.vue"
Cohesion: 0.08
Nodes (24): beratBadan, errBb, errLahir, errPb, errUkur, hasil, INDIKATOR_TAMPIL, indikatorImplausibel (+16 more)

### Community 19 - "AGENTS.md"
Cohesion: 0.14
Nodes (12): Alur Pengembangan Fitur, Data & Klasifikasi Status, graphify, Kolaborasi Tim, Konvensi, Konvensi Git & Perawatan Repo, Masalah Dikenal / Catatan, Modul Antropometri (standar WHO) (+4 more)

### Community 20 - "useAuth.ts"
Cohesion: 0.31
Nodes (9): daftar(), inisialisasi(), isAdmin, keluar(), masuk(), memuat, muatPeran(), useAuth() (+1 more)

### Community 21 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 22 - "LandingHero.vue"
Cohesion: 0.09
Nodes (18): KAMPANYE_HUT, TEX_KAMPANYE, LANGKAH, cekSesi, { isAutentikasi, inisialisasi }, MODUL_NAV, ModulNav, tujuanMasuk (+10 more)

### Community 23 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 24 - "AppNavbar.vue"
Cohesion: 0.10
Nodes (13): buka, bukaModul, bukaModulMobile, { isAutentikasi, user, inisialisasi, keluar }, labelModul, menuModul, MODUL, route (+5 more)

### Community 25 - "status.ts"
Cohesion: 0.27
Nodes (10): ALIAS_LABEL, DAFTAR_STATUS, infoStatus, kodeDariLabel(), LABEL_STATUS, labelStatus(), SEMUA_TONE, TONE_BADGE (+2 more)

### Community 26 - "Badge.vue"
Cohesion: 0.50
Nodes (3): delegatedProps, props, BadgeVariants

### Community 27 - "Input.vue"
Cohesion: 0.40
Nodes (3): emits, modelValue, props

### Community 28 - "client.ts"
Cohesion: 0.33
Nodes (3): anonKey, supabase, url

### Community 29 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 30 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 31 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 32 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 33 - "Reveal.vue"
Cohesion: 0.50
Nodes (3): el, { stop }, terlihat

### Community 37 - "src/views/DashboardView.vue"
Cohesion: 0.29
Nodes (5): { isAutentikasi, inisialisasi }, muatPerhatianError, muatPerhatianLoading, perluPerhatian, {
  statistik,
  statistikLoading,
  statistikError,
  labelBulanIni,
  SASARAN,
  KUNJUNGAN,
  muat: muatStatistik,
}

### Community 42 - "kbm.ts"
Cohesion: 0.38
Nodes (8): HasilKbm, hitungKbm(), KBM_TETAP, statusNaikDariTanggal(), statusNaikPerKbm(), hitungUmurBulan(), parseTanggal(), umurSaatIni()

### Community 48 - "views.test.ts"
Cohesion: 0.50
Nodes (3): dorong, OPSI_MOUNT, stateAuth

### Community 51 - "src/modules/balita/views/BalitaListView.vue"
Cohesion: 0.29
Nodes (5): {
  daftar, cari, sibuk, pesanError, modalTambah, modalUbahOpen, modalUbahData,
  modeView, bukaUbah, bersihkanCari, muat, hapusItem,
}, dlgHapus, { isAdmin }, route, router

### Community 53 - "src/modules/bumil/views/BumilDetailView.vue"
Cohesion: 0.07
Nodes (23): bumil, detailBaris, detailJudul, detailOpen, dlgHapus, editOpen, formatTanggal(), hapusDariTabel() (+15 more)

### Community 54 - "offlineAntre.ts"
Cohesion: 0.10
Nodes (30): adalahGalatJaringan(), adalahPostgrest(), lemparGalat(), PESA_AUTH, pesanGalat(), PETA_KODE_POSTGREST, SepertiPostgrest, AntreKunjungan (+22 more)

### Community 55 - "bumil/db.ts"
Cohesion: 0.12
Nodes (12): Bumil, InputBumil, InputKunjunganBumil, KATEGORI_BUMIL, KunjunganBumil, OPSI_BB_KURVA, OPSI_LILA, OPSI_TD_KURVA (+4 more)

### Community 56 - "src/modules/bumil/views/BumilListView.vue"
Cohesion: 0.33
Nodes (3): {
  daftar, cari, sibuk, pesanError, modalTambah, modalUbahOpen, modalUbahData,
  modeView, bukaUbah, bersihkanCari, muat, hapusItem,
}, dlgHapus, { isAdmin }

### Community 58 - "dialog/index.ts"
Cohesion: 0.06
Nodes (23): emits, forwarded, props, props, delegatedProps, emits, forwarded, props (+15 more)

### Community 59 - "FormKunjunganBumil.vue"
Cohesion: 0.07
Nodes (31): batuk, bbKurvaKia, bbTidakNaik, beratBadan, dapatEdukasi, dapatTtd, demam, dirujuk (+23 more)

### Community 60 - "src/modules/apras/views/AprasDetailView.vue"
Cohesion: 0.08
Nodes (22): apras, detailBaris, detailJudul, detailOpen, dlgHapus, editOpen, formatTanggal(), hapusDariTabel() (+14 more)

### Community 61 - "balita/ekspor.ts"
Cohesion: 0.13
Nodes (24): BARIS_RINGKASAN, BarisRingkasan, buatWorkbookRekap(), formatTanggalLokal(), GRUP_KOLOM, GrupKolomRekap, KEPALA_RINCIAN, KolomRekap (+16 more)

### Community 62 - "FormModalBalita.vue"
Cohesion: 0.09
Nodes (22): alamat, anakKe, bbLahir, dusun, emit, jenisKelamin, judul, memuat (+14 more)

### Community 63 - "FormModalBumil.vue"
Cohesion: 0.09
Nodes (22): alamat, caraPersalin, dusun, emit, hamilAnakKe, jarakAnakSebelumnya, judul, kategori (+14 more)

### Community 64 - "src/modules/balita/views/BalitaRekapView.vue"
Cohesion: 0.08
Nodes (13): baris, bulan, daftarTahun, error, judulRekap, jumlahAnak, loading, rekapFiltered (+5 more)

### Community 65 - "bumil/ekspor.ts"
Cohesion: 0.15
Nodes (19): buatWorkbookRekap(), GRUP_KOLOM, GrupKolomRekap, KolomRekap, muatXlsx(), NAMA_BULAN, susunMatriks(), susunMerge() (+11 more)

### Community 66 - "FormModalApras.vue"
Cohesion: 0.10
Nodes (19): alamat, dusun, emit, jenisKelamin, judul, memuat, nama, namaOrangTua (+11 more)

### Community 67 - "FormKunjunganApras.vue"
Cohesion: 0.11
Nodes (19): beratBadan, catatan, dirujuk, edukasi, emit, gejalaTbc, kosongkanForm(), lingkarKepala (+11 more)

### Community 68 - "balita/rekap.test.ts"
Cohesion: 0.16
Nodes (11): Apras, KunjunganApras, gabungAnakApras(), gabungKunjunganApras(), filterKunjunganPeriode(), filterKunjunganRentang(), gabungAnakBalita(), gabungKunjunganBalita() (+3 more)

### Community 69 - "src/modules/bumil/views/BumilRekapView.vue"
Cohesion: 0.15
Nodes (14): baris, bulan, daftarTahun, eksporExcel(), error, loading, muat(), rekapFiltered (+6 more)

### Community 70 - "apras/db.ts"
Cohesion: 0.16
Nodes (5): InputApras, InputKunjunganApras, susunIsiKunjungan(), tambahKunjunganApras(), ubahKunjunganApras()

### Community 71 - "balita/rekap.ts"
Cohesion: 0.21
Nodes (12): Balita, AnakGabungan, AnakStruktur, fungsiAktif(), hitungBbNaik(), hitungRekapBulanan(), klasifikasiSasaran(), KunjunganGabungan (+4 more)

### Community 72 - "Arsitektur"
Cohesion: 0.18
Nodes (9): Arsitektur, Auth & peran, Fungsi DB publik, Kalkulator & status gizi, Konvensi Keras, Perintah, Rekap balita, Struktur per-modul (+1 more)

### Community 73 - "InputSegmen.vue"
Cohesion: 0.18
Nodes (8): emit, OPSI_DUSUN, emit, OPSI_POSYANDU, diLuarOpsi, emit, labelTampil, props

### Community 74 - "Tugas: Navbar 5 modul + Modul Dewasa & Lansia + Statistik Apras di Beranda"
Cohesion: 0.22
Nodes (8): 1. Navbar (src/components/AppNavbar.vue), 2. Modul placeholder Dewasa & Lansia, 3. Statistik Posyandu tambah Apras, Batasan, Definisi selesai, Latar, Pekerjaan, Tugas: Navbar 5 modul + Modul Dewasa & Lansia + Statistik Apras di Beranda

### Community 75 - "Tugas: Perbaikan Form Apras + Dusun Button Group + Dewasa & Lansia Aktif"
Cohesion: 0.22
Nodes (8): 1. Form Apras — Susunan Ulang Field, 2. Dusun → Button Group 3 Opsi (semua modul), 3. Dewasa & Lansia Aktif di Landing Hero, Batasan, Definisi selesai, Latar, Pekerjaan, Tugas: Perbaikan Form Apras + Dusun Button Group + Dewasa & Lansia Aktif

### Community 76 - "ConfirmDialog.vue"
Cohesion: 0.22
Nodes (4): judul, merah, pesan, terbuka

### Community 77 - "useDaftarModul"
Cohesion: 0.33
Nodes (3): useDaftarModul(), hapusItem(), muat()

### Community 79 - "DetailKunjunganModal.vue"
Cohesion: 0.50
Nodes (4): emit, filteredBaris, props, tutup()

### Community 80 - "useStatistikPublik.ts"
Cohesion: 0.40
Nodes (3): KartuStatistik, StatistikPublik, useStatistikPublik()

### Community 81 - "src/modules/apras/views/AprasListView.vue"
Cohesion: 0.40
Nodes (3): {
  daftar, cari, sibuk, pesanError, modalTambah, modalUbahOpen, modalUbahData,
  modeView, bukaUbah, bersihkanCari, muat, hapusItem,
}, dlgHapus, { isAdmin }

### Community 83 - "DashboardLayanan.vue"
Cohesion: 0.50
Nodes (3): { isAutentikasi }, MODUL, ModulLayanan

## Knowledge Gaps
- **661 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `name`, `private`, `version` (+656 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `name` to the rest of the system?**
  _661 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/modules/balita/views/BalitaDetailView.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.05832147937411095 - nodes in this community are weakly interconnected._
- **Should `select/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `sheet/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._