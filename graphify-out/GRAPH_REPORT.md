# Graph Report - posyandu  (2026-08-15)

## Corpus Check
- 100 files · ~37,500 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 575 nodes · 575 edges · 51 communities (40 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.55)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a2d050a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- src/views/BalitaDetailView.vue
- select/index.ts
- dependencies
- compilerOptions
- sheet/index.ts
- kalkulator/index.ts
- devDependencies
- What You Must Do When Invoked
- KurvaWHO.vue
- db.ts
- src/views/BalitaFormView.vue
- src/views/LoginView.vue
- compilerOptions
- PRD — Sistem Informasi Posyandu (PosyanduGizi)
- Accordion.vue
- card/index.ts
- TooltipContent.vue
- src/views/KalkulatorView.vue
- router/index.ts
- AGENTS.md
- useAuth.ts
- graphify reference: extra exports and benchmark
- src/views/LandingView.vue
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
- tsconfig.json
- vercel.json
- extraction-spec.md

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 21 edges
2. `compilerOptions` - 13 edges
3. `PRD — Sistem Informasi Posyandu (PosyanduGizi)` - 13 edges
4. `What You Must Do When Invoked` - 12 edges
5. `hitungSemuaStatus()` - 10 edges
6. `/graphify` - 10 edges
7. `wajibSupabase()` - 9 edges
8. `graphify reference: extra exports and benchmark` - 8 edges
9. `scripts` - 5 edges
10. `useAuth()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `submit()` --calls--> `daftar`  [INFERRED]
  src/views/LoginView.vue → src/views/BalitaListView.vue
- `Props` --references--> `ButtonVariants`  [EXTRACTED]
  src/components/ui/button/Button.vue → src/components/ui/button/index.ts

## Import Cycles
- None detected.

## Communities (51 total, 11 thin omitted)

### Community 0 - "src/views/BalitaDetailView.vue"
Cohesion: 0.05
Nodes (40): asiEksklusif, balita, bbNaik, beratBadan, ceklisPerkembangan, edukasi, formatTanggal(), gejalaTbc (+32 more)

### Community 1 - "select/index.ts"
Cohesion: 0.05
Nodes (25): emits, forwarded, props, delegatedProps, emits, forwarded, props, props (+17 more)

### Community 2 - "dependencies"
Cohesion: 0.07
Nodes (28): class-variance-authority, clsx, @lucide/vue, dependencies, class-variance-authority, clsx, @lucide/vue, reka-ui (+20 more)

### Community 3 - "compilerOptions"
Cohesion: 0.07
Nodes (28): DOM, DOM.Iterable, ES2022, src/**/*.ts, src/**/*.tsx, src/**/*.vue, compilerOptions, allowImportingTsExtensions (+20 more)

### Community 4 - "sheet/index.ts"
Cohesion: 0.07
Nodes (18): emits, forwarded, props, props, delegatedProps, emits, forwarded, props (+10 more)

### Community 5 - "kalkulator/index.ts"
Cohesion: 0.13
Nodes (24): bulatkan2(), cariBarisPanjangTerdekat(), cariBarisUmur(), HasilStatusGizi, hitungSemuaStatus(), hitungZScoreLms(), klasifikasiBbtb(), klasifikasiBbu() (+16 more)

### Community 6 - "devDependencies"
Cohesion: 0.08
Nodes (25): happy-dom, devDependencies, happy-dom, playwright, tailwindcss, @tailwindcss/vite, tw-animate-css, @types/node (+17 more)

### Community 7 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 8 - "KurvaWHO.vue"
Cohesion: 0.11
Nodes (23): Baris, dataTitik, gabungLhfa, garisGrid, Indikator, LABEL_KURVA, LABEL_X, nilaiUntukZ() (+15 more)

### Community 9 - "db.ts"
Cohesion: 0.13
Nodes (18): ALIAS_LABEL, ambilBalita(), Balita, buatBalita(), hapusBalita(), hapusKunjungan(), InputBalita, InputKunjungan (+10 more)

### Community 10 - "src/views/BalitaFormView.vue"
Cohesion: 0.09
Nodes (19): alamat, anakKe, bbLahir, dusun, idEdit, jenisKelamin, memuat, nama (+11 more)

### Community 11 - "src/views/LoginView.vue"
Cohesion: 0.10
Nodes (17): cari, daftar, hapus(), { isAdmin }, muat(), pesanError, sibuk, email (+9 more)

### Community 12 - "compilerOptions"
Cohesion: 0.11
Nodes (17): ES2023, node, vite.config.ts, compilerOptions, allowImportingTsExtensions, lib, module, moduleDetection (+9 more)

### Community 13 - "PRD — Sistem Informasi Posyandu (PosyanduGizi)"
Cohesion: 0.12
Nodes (16): 10. Roadmap & Prioritas, 11. Risiko & Asumsi, 12. Pertanyaan Terbuka, 1. Ringkasan Produk, 2. Masalah & Peluang, 3. Pengguna & Peran, 4. Ruang Lingkup, 5. Fitur & Persyaratan (+8 more)

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
Cohesion: 0.15
Nodes (11): beratBadan, dihitung, hasil, INDIKATOR_TAMPIL, jk, panjangBadan, pesanError, tanggalLahir (+3 more)

### Community 19 - "AGENTS.md"
Cohesion: 0.18
Nodes (9): Data & Klasifikasi Status, graphify, Konvensi, Konvensi Git & Perawatan Repo, Masalah Dikenal / Catatan, Project Overview, Setup & Perintah, Struktur Proyek (+1 more)

### Community 20 - "useAuth.ts"
Cohesion: 0.31
Nodes (9): daftar(), inisialisasi(), isAdmin, keluar(), masuk(), memuat, muatPeran(), useAuth() (+1 more)

### Community 21 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 22 - "src/views/LandingView.vue"
Cohesion: 0.22
Nodes (8): berat, hasil, INDIKATOR, jk, KET, LANGKAH, panjang, umur

### Community 23 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 24 - "AppNavbar.vue"
Cohesion: 0.33
Nodes (4): buka, { isAutentikasi, user, inisialisasi, keluar }, route, TAUTAN

### Community 25 - "status.ts"
Cohesion: 0.33
Nodes (5): DAFTAR_STATUS, infoStatus, TONE_BADGE, TONE_DOT, ToneStatus

### Community 26 - "Badge.vue"
Cohesion: 0.50
Nodes (3): delegatedProps, props, BadgeVariants

### Community 27 - "Input.vue"
Cohesion: 0.40
Nodes (3): emits, modelValue, props

### Community 28 - "client.ts"
Cohesion: 0.40
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
Cohesion: 0.50
Nodes (3): { isAutentikasi, user, inisialisasi }, MODUL, ModulPosyandu

## Knowledge Gaps
- **354 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `name`, `private`, `version` (+349 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `name` to the rest of the system?**
  _354 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `src/views/BalitaDetailView.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.045454545454545456 - nodes in this community are weakly interconnected._
- **Should `select/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05405405405405406 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `sheet/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._