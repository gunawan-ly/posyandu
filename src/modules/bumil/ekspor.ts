// Ekspor Rekap Tahunan Bumil/Busui: definisi kolom bersama (dipakai tabel UI,
// workbook XLSX & CSV), penyusun lembar kerja, dan teks CSV.
//
// SheetJS (xlsx, ~350 KB) dimuat lewat impor dinamis agar tidak masuk chunk
// halaman rekap — hanya diunduh saat pengguna benar-benar mengekspor.
import type * as XLSX from 'xlsx'
import type { BarisRekapBumil } from './rekap'
import { hitungRekapTahunan, totalKolom } from './rekap'

function muatXlsx(): Promise<typeof XLSX> {
  return import('xlsx')
}

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

export interface KolomRekap {
  label: string
  ambil: (b: BarisRekapBumil) => number
}

export interface GrupKolomRekap {
  grup: string
  kolom: KolomRekap[]
}

// Satu sumber kebenaran struktur tabel rekap (urutan sesuai format resmi).
export const GRUP_KOLOM: GrupKolomRekap[] = [
  {
    grup: 'Jumlah Sasaran',
    kolom: [
      { label: 'Ibu Hamil', ambil: (b) => b.sasaranHamil },
      { label: 'Ibu Nifas/Menyusui', ambil: (b) => b.sasaranMenyusui },
    ],
  },
  {
    grup: 'Datang (Hadir)',
    kolom: [
      { label: 'Ibu Hamil', ambil: (b) => b.datangHamil },
      { label: 'Ibu Nifas/Menyusui', ambil: (b) => b.datangMenyusui },
    ],
  },
  {
    grup: 'Tidak Datang',
    kolom: [
      { label: 'Ibu Hamil', ambil: (b) => b.tidakDatangHamil },
      { label: 'Ibu Nifas/Menyusui', ambil: (b) => b.tidakDatangMenyusui },
    ],
  },
  {
    grup: 'Berat Badan',
    kolom: [
      { label: 'Hijau', ambil: (b) => b.bbHijau },
      { label: 'Merah', ambil: (b) => b.bbMerah },
    ],
  },
  {
    grup: 'Lingkar Lengan Atas',
    kolom: [
      { label: 'Hijau', ambil: (b) => b.lilaHijau },
      { label: 'Merah/KEK', ambil: (b) => b.lilaMerah },
    ],
  },
  {
    grup: 'Tekanan Darah',
    kolom: [
      { label: 'Hijau', ambil: (b) => b.tdHijau },
      { label: 'Merah', ambil: (b) => b.tdMerah },
    ],
  },
  {
    grup: 'Bergejala TBC',
    kolom: [{ label: 'Memenuhi 2 Gejala', ambil: (b) => b.bergejalaTbc }],
  },
  {
    grup: 'TTD',
    kolom: [
      { label: 'Dapatkan', ambil: (b) => b.ttdDapat },
      { label: 'Konsumsi Setiap Hari', ambil: (b) => b.ttdSetiapHari },
      { label: 'Konsumsi Tidak', ambil: (b) => b.ttdTidak },
    ],
  },
  {
    grup: 'PMT Bumil KEK',
    kolom: [
      { label: 'Mendapatkan', ambil: (b) => b.pmtDapat },
      { label: 'Konsumsi Setiap Hari', ambil: (b) => b.pmtSetiapHari },
      { label: 'Konsumsi Tidak', ambil: (b) => b.pmtTidak },
    ],
  },
  {
    grup: 'Kelas Ibu Hamil',
    kolom: [
      { label: 'Ya', ambil: (b) => b.kelasYa },
      { label: 'Tidak', ambil: (b) => b.kelasTidak },
    ],
  },
  {
    grup: 'Vitamin A Nifas',
    kolom: [
      { label: 'Ya', ambil: (b) => b.vitAYa },
      { label: 'Tidak', ambil: (b) => b.vitATidak },
    ],
  },
  {
    grup: 'KB Pasca Persalinan',
    kolom: [
      { label: 'Ya', ambil: (b) => b.kbYa },
      { label: 'Tidak', ambil: (b) => b.kbTidak },
    ],
  },
  {
    grup: 'Edukasi',
    kolom: [{ label: 'Mendapatkan', ambil: (b) => b.edukasi }],
  },
  {
    grup: 'Dirujuk',
    kolom: [
      { label: 'Ibu Hamil', ambil: (b) => b.rujukHamil },
      { label: 'Ibu Nifas/Menyusui', ambil: (b) => b.rujukMenyusui },
    ],
  },
]

// Susun matriks AoA siap jadi sheet: header grup, header kolom, 12 bulan, JUMLAH.
function susunMatriks(baris: BarisRekapBumil[], tahun: number): (string | number)[][] {
  const kepalaGrup: (string | number)[] = ['Bulan']
  const kepalaKolom: (string | number)[] = ['']
  for (const g of GRUP_KOLOM) {
    kepalaGrup.push(g.grup, ...Array(g.kolom.length - 1).fill(''))
    kepalaKolom.push(...g.kolom.map((k) => k.label))
  }

  const isi = baris.map((b) => [
    `${NAMA_BULAN[b.bulan]} ${tahun}`,
    ...GRUP_KOLOM.flatMap((g) => g.kolom.map((k) => {
      const v = k.ambil(b)
      return v === 0 ? '-' : v
    })),
  ])

  const jumlah: (string | number)[] = [
    'JUMLAH',
    ...GRUP_KOLOM.flatMap((g) => g.kolom.map((k) => {
      const v = totalKolom(baris, k.ambil)
      return v === 0 ? '-' : v
    })),
  ]

  return [kepalaGrup, kepalaKolom, ...isi, jumlah]
}

// Posisi merge baris judul grup: kolom 0 digabung vertikal (Bulan), tiap grup
// digabung horizontal sepanjang jumlah sub-kolomnya.
function susunMerge(): XLSX.Range[] {
  const merges: XLSX.Range[] = [{ s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }]
  let c = 1
  for (const g of GRUP_KOLOM) {
    if (g.kolom.length > 1) merges.push({ s: { r: 0, c }, e: { r: 0, c: c + g.kolom.length - 1 } })
    c += g.kolom.length
  }
  return merges
}

export async function buatWorkbookRekap(
  kunjungan: Parameters<typeof hitungRekapTahunan>[0],
  tahun: number,
): Promise<XLSX.WorkBook> {
  const X = await muatXlsx()
  const baris = hitungRekapTahunan(kunjungan, tahun)
  const ws = X.utils.aoa_to_sheet(susunMatriks(baris, tahun))
  ws['!merges'] = susunMerge()
  ws['!cols'] = [{ wch: 16 }, ...Array(GRUP_KOLOM.reduce((n, g) => n + g.kolom.length, 0)).fill({ wch: 11 })]
  const wb = X.utils.book_new()
  X.utils.book_append_sheet(wb, ws, `Rekapitulasi ${tahun}`)
  return wb
}

export async function unduhXlsx(
  kunjungan: Parameters<typeof hitungRekapTahunan>[0],
  tahun: number,
): Promise<void> {
  const X = await muatXlsx()
  const wb = await buatWorkbookRekap(kunjungan, tahun)
  X.writeFile(wb, `rekapitulasi-bumil-${tahun}.xlsx`)
}

// Teks CSV (nilai dipisah titik koma agar rapi dibuka di Excel Indonesia).
export async function teksCsvRekap(
  kunjungan: Parameters<typeof hitungRekapTahunan>[0],
  tahun: number,
): Promise<string> {
  const baris = hitungRekapTahunan(kunjungan, tahun)
  const matriks = susunMatriks(baris, tahun)
  return matriks.map((barisData) => barisData.join(';')).join('\n')
}
