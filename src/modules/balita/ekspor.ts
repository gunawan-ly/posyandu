// Ekspor Rekap Tahunan Balita: GRUP_KOLOM (sumber tunggal kolom),
// susunMatriks (AoA utk spreadsheet), susunMerge, unduhXlsx, teksCsv.
// SheetJS dimuat lewat impor dinamis (~350 KB) hanya saat ekspor.
import type * as XLSX from 'xlsx'
import type { BarisRekap, RekapBulanan } from './rekap'
import type { AnakGabungan, KunjunganGabungan } from './rekap'
import { hitungRekapTahunan } from './rekap'
import { parseTanggal } from '@/lib/umur'

function muatXlsx(): Promise<typeof XLSX> {
  return import('xlsx')
}

export const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
] as const

// ---- Tipe kolom ----

export interface KolomRekap {
  label: string
  ambil: (b: RekapBulanan) => number
}

export interface GrupKolomRekap {
  grup: string
  kolom: KolomRekap[]
}

// ---- GRUP_KOLOM: sumber tunggal struktur kolom (UI + Excel + CSV) ----

export const GRUP_KOLOM: GrupKolomRekap[] = [
  {
    grup: 'Jumlah Sasaran',
    kolom: [
      { label: 'Bayi (0–6 bln)', ambil: (r) => r.sasaran_bayi },
      { label: 'Balita & Apras (≥6–72 bln)', ambil: (r) => r.sasaran_balita },
    ],
  },
  {
    grup: 'Datang (Hadir)',
    kolom: [
      { label: 'Bayi (0–6 bln)', ambil: (r) => r.bayi_hadir },
      { label: 'Balita & Apras (≥6–72 bln)', ambil: (r) => r.balita_hadir },
    ],
  },
  {
    grup: 'Tidak Datang',
    kolom: [
      { label: 'Bayi (0–6 bln)', ambil: (r) => r.bayi_tidak_hadir },
      { label: 'Balita & Apras (≥6–72 bln)', ambil: (r) => r.balita_tidak_hadir },
    ],
  },
  {
    grup: 'Ceklis Perkembangan',
    kolom: [
      { label: 'Lengkap', ambil: (r) => r.ceklis_lengkap },
      { label: 'Tidak Lengkap', ambil: (r) => r.ceklis_tidak_lengkap },
    ],
  },
  {
    grup: 'BB/U (0–5 th)',
    kolom: [
      { label: 'Naik', ambil: (r) => r.bb_naik },
      { label: 'Tidak Naik', ambil: (r) => r.bb_tidak_naik },
      { label: 'Gizi Baik', ambil: (r) => r.bbu_normal },
      { label: 'Tidak Normal', ambil: (r) => r.bbu_tidak_normal },
    ],
  },
  {
    grup: 'PB/TB/U (0–5 th)',
    kolom: [
      { label: 'Normal', ambil: (r) => r.tbu_normal },
      { label: 'Tidak Normal', ambil: (r) => r.tbu_tidak_normal },
    ],
  },
  {
    grup: 'BB/PB atau BB/TB',
    kolom: [
      { label: 'Gizi Baik', ambil: (r) => r.bbtb_normal },
      { label: 'Tidak Normal', ambil: (r) => r.bbtb_tidak_normal },
    ],
  },
  {
    grup: 'Lingkar Kepala',
    kolom: [
      { label: 'Normal', ambil: (r) => r.lika_normal },
      { label: 'Tidak Normal', ambil: (r) => r.lika_tidak_normal },
    ],
  },
  {
    grup: 'Lingkar Lengan Atas',
    kolom: [
      { label: 'Normal', ambil: (r) => r.lila_normal },
      { label: 'Gizi Kurang', ambil: (r) => r.lila_tidak_normal },
    ],
  },
  {
    grup: 'Bergejala TBC',
    kolom: [
      { label: 'Memenuhi 2 Gejala', ambil: (r) => r.gejala_tbc_ya },
    ],
  },
  {
    grup: 'Jumlah Bayi/Balita mendapat',
    kolom: [
      { label: 'ASI Eksklusif (0–6 bln)', ambil: (r) => r.asi_ya },
      { label: 'MP ASI (>6 bln)', ambil: (r) => r.mpasi_ya },
      { label: 'Imunisasi', ambil: (r) => r.imunisasi_ya },
      { label: 'Vitamin A', ambil: (r) => r.vitamin_ya },
      { label: 'Obat Cacing', ambil: (r) => r.cacing_ya },
      { label: 'MT Pangan Lokal', ambil: (r) => r.mt_pangan_lokal_ya },
    ],
  },
  {
    grup: 'Edukasi',
    kolom: [
      { label: 'Mendapatkan', ambil: (r) => r.edukasi_ya },
    ],
  },
  {
    grup: 'Jumlah Balita Sakit',
    kolom: [
      { label: 'Sakit', ambil: (r) => r.sakit_ya },
    ],
  },
  {
    grup: 'Dirujuk',
    kolom: [
      { label: 'Bayi (0–6 bln)', ambil: (r) => r.dirujuk_bayi },
      { label: 'Balita & Apras (≥6–72 bln)', ambil: (r) => r.dirujuk_balita },
    ],
  },
]

// ---- Helper ----

export function totalKolom(baris: RekapBulanan[], ambil: (b: RekapBulanan) => number): number {
  return baris.reduce((s, b) => s + ambil(b), 0)
}

// ---- Matriks untuk spreadsheet (AoA) ----

export function susunMatriks(baris: RekapBulanan[], tahun: number): (string | number)[][] {
  // Row 0: kepala grup (colspan)
  const kepalaGrup: (string | number)[] = ['Bulan', 'Tahun']
  for (const g of GRUP_KOLOM) {
    kepalaGrup.push(g.grup)
    for (let i = 1; i < g.kolom.length; i++) kepalaGrup.push('')
  }

  // Row 1: kepala kolom
  const kepalaKolom: (string | number)[] = ['', '']
  for (const g of GRUP_KOLOM) {
    for (const k of g.kolom) kepalaKolom.push(k.label)
  }

  // Rows 2–13: data per bulan
  const isi: (string | number)[][] = baris.map((b, i) => {
    const barisData: (string | number)[] = [NAMA_BULAN[i], tahun]
    for (const g of GRUP_KOLOM) {
      for (const k of g.kolom) barisData.push(k.ambil(b))
    }
    return barisData
  })

  // Row 14: JUMLAH
  const jumlah: (string | number)[] = ['JUMLAH', '']
  for (const g of GRUP_KOLOM) {
    for (const k of g.kolom) jumlah.push(totalKolom(baris, k.ambil))
  }

  return [kepalaGrup, kepalaKolom, ...isi, jumlah]
}

// ---- Merge cells untuk header grup ----

export function susunMerge(): XLSX.Range[] {
  const merge: XLSX.Range[] = []
  // "Bulan" spans rows 0–1 (col 0)
  merge.push({ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } })
  // "Tahun" spans rows 0–1 (col 1)
  merge.push({ s: { r: 0, c: 1 }, e: { r: 1, c: 1 } })

  let col = 2
  for (const g of GRUP_KOLOM) {
    if (g.kolom.length > 1) {
      merge.push({ s: { r: 0, c: col }, e: { r: 0, c: col + g.kolom.length - 1 } })
    }
    col += g.kolom.length
  }
  return merge
}

// ---- Workbook ----

export async function buatWorkbookRekap(
  kunjunganGabungan: KunjunganGabungan[],
  anak: AnakGabungan[],
  tahun: number,
  baris: BarisRekap[],
): Promise<XLSX.WorkBook> {
  const X = await muatXlsx()
  const wb = X.utils.book_new()

  // Sheet 1: Rekap Tahunan
  const barisRekap = hitungRekapTahunan(kunjunganGabungan, anak, tahun)
  const matriks = susunMatriks(barisRekap, tahun)
  const sheet = X.utils.aoa_to_sheet(matriks)
  sheet['!merges'] = susunMerge()
  sheet['!cols'] = [{ wch: 16 }, ...Array.from({ length: 37 }, () => ({ wch: 11 }))]
  X.utils.book_append_sheet(wb, sheet, `Rekap ${tahun}`)

  // Sheet 2: Rincian Per Anak
  if (baris.length > 0) {
    const rincian = X.utils.aoa_to_sheet(susunLembarRincian(baris))
    X.utils.book_append_sheet(wb, rincian, 'Rincian')
  }

  return wb
}

export function unduhXlsx(workbook: XLSX.WorkBook, namaFile: string): void {
  void import('xlsx').then((X) => X.writeFile(workbook, namaFile))
}

// ---- Lembar Rincian (detail per anak, dipakai juga di CSV) ----

export const KEPALA_RINCIAN = [
  'No', 'Nama', 'Modul', 'Jenis Kelamin', 'Tanggal Lahir', 'Umur (bln)',
  'Dusun', 'Posyandu', 'Tanggal Kunjungan', 'BB (kg)', 'TB (cm)',
  'BB/U', 'TB/U', 'BB/TB', 'LiKA', 'LiLA', 'z-BB/U', 'z-TB/U', 'z-BB/TB',
]

export function susunLembarRincian(baris: BarisRekap[]): (string | number | null)[][] {
  const lembar: (string | number | null)[][] = [KEPALA_RINCIAN]
  for (const [i, b] of baris.entries()) {
    lembar.push([
      i + 1, b.nama, b.modul, b.jenis_kelamin, b.tanggal_lahir, b.umur_bulan,
      b.dusun, b.posyandu, b.tanggal_kunjungan, b.berat_badan, b.tinggi_badan,
      b.bb_menurut_umur, b.pbtb_menurut_umur, b.bb_menurut_pbtb,
      b.status_lingkar_kepala, b.status_lingkar_lengan,
      b.z_bb_u, b.z_tb_u, b.z_bb_tb,
    ])
  }
  return lembar
}

export async function teksCsvRincian(baris: BarisRekap[]): Promise<string> {
  const X = await muatXlsx()
  const lembar = X.utils.aoa_to_sheet(susunLembarRincian(baris))
  return X.utils.sheet_to_csv(lembar)
}

// ---- Label periode (tetap dipakai view) ----

export function labelPeriodeTahunan(tahun: number): string {
  return `TAHUN ${tahun}`
}

// ---- Kompatibilitas sementara (dihapus saat view refactor di Commit 4) ----

export const NAMA_BULAN_LABEL = NAMA_BULAN

function formatTanggalLokal(tgl: Date): string {
  const d = String(tgl.getDate()).padStart(2, '0')
  const m = String(tgl.getMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${tgl.getFullYear()}`
}

export function labelPeriode(periode: { bulan: number; tahun: number } | { awal: string; akhir: string }): string {
  if ('bulan' in periode) {
    return `${NAMA_BULAN[periode.bulan].toUpperCase()} ${periode.tahun}`
  }
  const awal = parseTanggal(periode.awal)
  const akhir = parseTanggal(periode.akhir)
  if (!awal || !akhir) return ' - '
  return `${formatTanggalLokal(awal)} - ${formatTanggalLokal(akhir)}`
}

export interface BarisRingkasan {
  label: string
  ambil: (r: RekapBulanan) => number
}

export const BARIS_RINGKASAN: BarisRingkasan[] = [
  { label: 'Jumlah Sasaran - Bayi', ambil: (r) => r.sasaran_bayi },
  { label: 'Jumlah Sasaran - Balita', ambil: (r) => r.sasaran_balita },
  { label: 'Bayi Datang (Hadir)', ambil: (r) => r.bayi_hadir },
  { label: 'Bayi Tidak Datang (Tidak Hadir)', ambil: (r) => r.bayi_tidak_hadir },
  { label: 'Balita Datang (Hadir)', ambil: (r) => r.balita_hadir },
  { label: 'Balita Tidak Datang (Tidak Hadir)', ambil: (r) => r.balita_tidak_hadir },
  { label: 'Ceklis Perkembangan - Lengkap', ambil: (r) => r.ceklis_lengkap },
  { label: 'Ceklis Perkembangan - Tidak Lengkap', ambil: (r) => r.ceklis_tidak_lengkap },
  { label: 'Berat Badan - Naik', ambil: (r) => r.bb_naik },
  { label: 'Berat Badan - Tidak Naik', ambil: (r) => r.bb_tidak_naik },
  { label: 'BB/U - Normal', ambil: (r) => r.bbu_normal },
  { label: 'BB/U - Tidak Normal', ambil: (r) => r.bbu_tidak_normal },
  { label: 'TB/U - Normal', ambil: (r) => r.tbu_normal },
  { label: 'TB/U - Tidak Normal', ambil: (r) => r.tbu_tidak_normal },
  { label: 'BB/TB - Normal', ambil: (r) => r.bbtb_normal },
  { label: 'BB/TB - Tidak Normal', ambil: (r) => r.bbtb_tidak_normal },
  { label: 'Lingkar Kepala - Normal', ambil: (r) => r.lika_normal },
  { label: 'Lingkar Kepala - Tidak Normal', ambil: (r) => r.lika_tidak_normal },
  { label: 'Lingkar Lengan - Normal', ambil: (r) => r.lila_normal },
  { label: 'Lingkar Lengan - Tidak Normal', ambil: (r) => r.lila_tidak_normal },
  { label: 'Imunisasi - Ya', ambil: (r) => r.imunisasi_ya },
  { label: 'Imunisasi - Tidak', ambil: (r) => r.imunisasi_tidak },
  { label: 'Vitamin A - Ya', ambil: (r) => r.vitamin_ya },
  { label: 'Vitamin A - Tidak', ambil: (r) => r.vitamin_tidak },
  { label: 'ASI - Ya', ambil: (r) => r.asi_ya },
  { label: 'ASI - Tidak', ambil: (r) => r.asi_tidak },
  { label: 'MP ASI - Ya', ambil: (r) => r.mpasi_ya },
  { label: 'MP ASI - Tidak', ambil: (r) => r.mpasi_tidak },
  { label: 'Obat Cacing - Ya', ambil: (r) => r.cacing_ya },
  { label: 'Obat Cacing - Tidak', ambil: (r) => r.cacing_tidak },
  { label: 'Edukasi - Ya', ambil: (r) => r.edukasi_ya },
  { label: 'Edukasi - Tidak', ambil: (r) => r.edukasi_tidak },
]

export function susunLembarRingkasan(rekap: RekapBulanan, periodeLabel: string): (string | number)[][] {
  const baris: (string | number)[][] = [
    ['REKAP BULANAN POSYANDU - BALITA', ''],
    ['Periode', periodeLabel],
    [],
    ['Keterangan', 'Jumlah'],
  ]
  for (const { label, ambil } of BARIS_RINGKASAN) {
    baris.push([label, ambil(rekap)])
  }
  return baris
}

export async function teksCsvRekap(baris: BarisRekap[]): Promise<string> {
  return teksCsvRincian(baris)
}
