// Helper ekspor Rekap Bulanan Posyandu: label periode, lembar ringkasan/rincian,
// workbook XLSX, dan CSV. Semua fungsi murni (dapat dites di Node).
import * as XLSX from 'xlsx'
import type { BarisRekap, PeriodeRekap, RekapBulanan } from './rekap'
import { parseTanggal } from '@/lib/umur'

export const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
] as const

// Format tanggal dd/mm/yyyy.
function formatTanggal(tgl: Date): string {
  const d = String(tgl.getDate()).padStart(2, '0')
  const m = String(tgl.getMonth() + 1).padStart(2, '0')
  return `${d}/${m}/${tgl.getFullYear()}`
}

// Label periode: bulan (0-indexed)+tahun → "AGUSTUS 2026"; rentang → "01/08/2026 - 31/08/2026".
// Bila rentang tidak valid → " - ".
export function labelPeriode(periode: PeriodeRekap): string {
  if ('bulan' in periode) {
    return `${NAMA_BULAN[periode.bulan].toUpperCase()} ${periode.tahun}`
  }
  const awal = parseTanggal(periode.awal)
  const akhir = parseTanggal(periode.akhir)
  if (!awal || !akhir) return ' - '
  return `${formatTanggal(awal)} - ${formatTanggal(akhir)}`
}

// Pasangan Keterangan|Jumlah berurutan mengikuti FORMAT REKAP BULANAN POSYANDU.
// Sumber tunggal bagi lembar Ringkasan (ekspor) & tabel format resmi (halaman rekap).
export interface BarisRingkasan {
  label: string
  ambil: (r: RekapBulanan) => number
}

export const BARIS_RINGKASAN: BarisRingkasan[] = [
  { label: 'Jumlah Sasaran - Bayi', ambil: (r) => r.sasaran_bayi },
  { label: 'Jumlah Sasaran - Balita', ambil: (r) => r.sasaran_balita },
  { label: 'Bayi Datang (Hadir)', ambil: (r) => r.bayi_hadir },
  { label: 'Bayi Tidak Datang (Tidak Hadir)', ambil: (r) => r.bayi_tidak_hadir },
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

// Lembar "Ringkasan": judul, periode, lalu pasangan Keterangan|Jumlah berurutan
// mengikuti FORMAT REKAP BULANAN POSYANDU.
export function susunLembarRingkasan(rekap: RekapBulanan, labelPeriode: string): (string | number)[][] {
  const baris: (string | number)[][] = [
    ['REKAP BULANAN POSYANDU - BALITA', ''],
    ['Periode', labelPeriode],
    [],
    ['Keterangan', 'Jumlah'],
  ]
  for (const { label, ambil } of BARIS_RINGKASAN) {
    baris.push([label, ambil(rekap)])
  }
  return baris
}

export const KEPALA_RINCIAN = [
  'No',
  'Nama',
  'Jenis Kelamin',
  'Tanggal Lahir',
  'Umur (bln)',
  'Dusun',
  'Posyandu',
  'Tanggal Kunjungan',
  'BB (kg)',
  'TB (cm)',
  'BB/U',
  'TB/U',
  'BB/TB',
  'LiKA',
  'LiLA',
  'z-BB/U',
  'z-TB/U',
  'z-BB/TB',
]

// Lembar "Rincian": header kolom lalu satu baris per BalitaRekap.
// Nilai null dipertahankan agar saat diekspor menjadi sel kosong.
export function susunLembarRincian(baris: BarisRekap[]): (string | number | null)[][] {
  const lembar: (string | number | null)[][] = [KEPALA_RINCIAN]
  for (const [i, b] of baris.entries()) {
    lembar.push([
      i + 1,
      b.nama,
      b.jenis_kelamin,
      b.tanggal_lahir,
      b.umur_bulan,
      b.dusun,
      b.posyandu,
      b.tanggal_kunjungan,
      b.berat_badan,
      b.tinggi_badan,
      b.bb_menurut_umur,
      b.pbtb_menurut_umur,
      b.bb_menurut_pbtb,
      b.status_lingkar_kepala,
      b.status_lingkar_lengan,
      b.z_bb_u,
      b.z_tb_u,
      b.z_bb_tb,
    ])
  }
  return lembar
}

// Workbook XLSX: sheet "Ringkasan" (pertama) + "Rincian".
export function buatWorkbookRekap(
  rekap: RekapBulanan,
  baris: BarisRekap[],
  periodeLabel: string,
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new()
  const ringkasan = XLSX.utils.aoa_to_sheet(susunLembarRingkasan(rekap, periodeLabel))
  ringkasan['!cols'] = [{ wch: 40 }]
  const rincian = XLSX.utils.aoa_to_sheet(susunLembarRincian(baris))
  XLSX.utils.book_append_sheet(wb, ringkasan, 'Ringkasan')
  XLSX.utils.book_append_sheet(wb, rincian, 'Rincian')
  return wb
}

// Simpan workbook ke file (dipakai di browser). Tidak dipanggil dalam test.
export function unduhXlsx(workbook: XLSX.WorkBook, namaFile: string): void {
  XLSX.writeFile(workbook, namaFile)
}

// CSV dari lembar rincian (nilai null → string kosong).
export function teksCsvRekap(baris: BarisRekap[]): string {
  const lembar = XLSX.utils.aoa_to_sheet(susunLembarRincian(baris))
  return XLSX.utils.sheet_to_csv(lembar)
}
