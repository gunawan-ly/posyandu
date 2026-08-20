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

// Lembar "Ringkasan": judul, periode, lalu pasangan Keterangan|Jumlah berurutan
// mengikuti FORMAT REKAP BULANAN POSYANDU.
export function susunLembarRingkasan(rekap: RekapBulanan, labelPeriode: string): (string | number)[][] {
  return [
    ['REKAP BULANAN POSYANDU - BALITA', ''],
    ['Periode', labelPeriode],
    [],
    ['Keterangan', 'Jumlah'],
    ['Jumlah Sasaran - Bayi', rekap.sasaran_bayi],
    ['Jumlah Sasaran - Balita', rekap.sasaran_balita],
    ['Bayi Datang (Hadir)', rekap.bayi_hadir],
    ['Bayi Tidak Datang (Tidak Hadir)', rekap.bayi_tidak_hadir],
    ['Ceklis Perkembangan - Lengkap', rekap.ceklis_lengkap],
    ['Ceklis Perkembangan - Tidak Lengkap', rekap.ceklis_tidak_lengkap],
    ['Berat Badan - Naik', rekap.bb_naik],
    ['Berat Badan - Tidak Naik', rekap.bb_tidak_naik],
    ['BB/U - Normal', rekap.bbu_normal],
    ['BB/U - Tidak Normal', rekap.bbu_tidak_normal],
    ['TB/U - Normal', rekap.tbu_normal],
    ['TB/U - Tidak Normal', rekap.tbu_tidak_normal],
    ['BB/TB - Normal', rekap.bbtb_normal],
    ['BB/TB - Tidak Normal', rekap.bbtb_tidak_normal],
    ['Lingkar Kepala - Normal', rekap.lika_normal],
    ['Lingkar Kepala - Tidak Normal', rekap.lika_tidak_normal],
    ['Lingkar Lengan - Normal', rekap.lila_normal],
    ['Lingkar Lengan - Tidak Normal', rekap.lila_tidak_normal],
    ['Imunisasi - Ya', rekap.imunisasi_ya],
    ['Imunisasi - Tidak', rekap.imunisasi_tidak],
    ['Vitamin A - Ya', rekap.vitamin_ya],
    ['Vitamin A - Tidak', rekap.vitamin_tidak],
    ['ASI - Ya', rekap.asi_ya],
    ['ASI - Tidak', rekap.asi_tidak],
    ['MP ASI - Ya', rekap.mpasi_ya],
    ['MP ASI - Tidak', rekap.mpasi_tidak],
    ['Obat Cacing - Ya', rekap.cacing_ya],
    ['Obat Cacing - Tidak', rekap.cacing_tidak],
    ['Edukasi - Ya', rekap.edukasi_ya],
    ['Edukasi - Tidak', rekap.edukasi_tidak],
  ]
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
