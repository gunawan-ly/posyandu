import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import type { BarisRekap, RekapBulanan } from './rekap'
import { buatWorkbookRekap, labelPeriodeTahunan, susunLembarRincian, susunMatriks, teksCsvRincian, totalKolom, GRUP_KOLOM } from './ekspor'

// Fixture RekapBulanan lengkap (beberapa angka non-zero).
const rekap: RekapBulanan = {
  sasaran_bayi: 5,
  sasaran_balita: 12,
  bayi_hadir: 4,
  bayi_tidak_hadir: 1,
  balita_hadir: 10,
  balita_tidak_hadir: 2,
  ceklis_lengkap: 3,
  ceklis_tidak_lengkap: 1,
  bb_naik: 2,
  bb_tidak_naik: 2,
  bbu_normal: 3,
  bbu_tidak_normal: 1,
  tbu_normal: 4,
  tbu_tidak_normal: 0,
  bbtb_normal: 3,
  bbtb_tidak_normal: 1,
  lika_normal: 2,
  lika_tidak_normal: 2,
  lila_normal: 4,
  lila_tidak_normal: 0,
  imunisasi_ya: 4,
  imunisasi_tidak: 0,
  vitamin_ya: 3,
  vitamin_tidak: 1,
  asi_ya: 2,
  asi_tidak: 2,
  mpasi_ya: 3,
  mpasi_tidak: 1,
  cacing_ya: 4,
  cacing_tidak: 0,
  edukasi_ya: 4,
  edukasi_tidak: 0,
  gejala_tbc_ya: 1,
  mt_pangan_lokal_ya: 0,
  sakit_ya: 2,
  dirujuk_bayi: 1,
  dirujuk_balita: 1,
}

// Fixture BarisRekap: baris pertama lengkap, baris kedua banyak nilai null.
const baris: BarisRekap[] = [
  {
    modul: 'Balita',
    nama: 'Ani',
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2025-06-15',
    umur_bulan: 8,
    dusun: 'Wapalo',
    posyandu: 'Posyandu Wapalo',
    tanggal_kunjungan: '2026-02-10',
    berat_badan: 8.5,
    tinggi_badan: 70,
    bb_menurut_umur: 'Normal',
    pbtb_menurut_umur: 'Normal',
    bb_menurut_pbtb: 'Gizi Baik',
    status_lingkar_kepala: 'Normal',
    status_lingkar_lengan: 'Normal',
    z_bb_u: -0.5,
    z_tb_u: 0.2,
    z_bb_tb: -0.1,
  },
  {
    modul: 'Balita',
    nama: 'Budi',
    jenis_kelamin: 'Laki - Laki',
    tanggal_lahir: '2024-02-10',
    umur_bulan: null,
    dusun: null,
    posyandu: null,
    tanggal_kunjungan: null,
    berat_badan: null,
    tinggi_badan: null,
    bb_menurut_umur: null,
    pbtb_menurut_umur: null,
    bb_menurut_pbtb: null,
    status_lingkar_kepala: null,
    status_lingkar_lengan: null,
    z_bb_u: null,
    z_tb_u: null,
    z_bb_tb: null,
  },
]

describe('labelPeriodeTahunan', () => {
  it('tahun → "TAHUN 2026"', () => {
    expect(labelPeriodeTahunan(2026)).toBe('TAHUN 2026')
  })
})

describe('totalKolom', () => {
  it('menjumlahkan semua nilai dari RekapBulanan[]', () => {
    const barisRekap = [rekap]
    expect(totalKolom(barisRekap, (r) => r.sasaran_bayi)).toBe(5)
    expect(totalKolom(barisRekap, (r) => r.balita_hadir)).toBe(10)
  })
})

describe('GRUP_KOLOM', () => {
  it('memiliki tepat 14 grup', () => {
    expect(GRUP_KOLOM).toHaveLength(14)
  })
})

describe('susunMatriks', () => {
  it('menghasilkan 14 baris: 2 header + 12 bulan + 1 JUMLAH', () => {
    const barisRekap = Array.from({ length: 12 }, () => rekap)
    const matriks = susunMatriks(barisRekap)
    expect(matriks).toHaveLength(15)
    // Baris 0: header grup — kolom Bulan saja
    expect(matriks[0][0]).toBe('Bulan')
    // Baris 1: header kolom — kolom Bulan kosong
    expect(matriks[1][0]).toBe('')
    // Baris 2: Januari
    expect(matriks[2][0]).toBe('Januari')
    // Baris 13: JUMLAH
    expect(matriks[14][0]).toBe('JUMLAH')
  })
})

describe('susunLembarRincian', () => {
  it('memuat header kolom lalu satu baris per BarisRekap', () => {
    const lembar = susunLembarRincian(baris)
    expect(lembar[0]).toEqual([
      'No', 'Nama', 'Modul', 'Jenis Kelamin', 'Tanggal Lahir', 'Umur (bln)',
      'Dusun', 'Posyandu', 'Tanggal Kunjungan', 'BB (kg)', 'TB (cm)',
      'BB/U', 'TB/U', 'BB/TB', 'LiKA', 'LiLA', 'z-BB/U', 'z-TB/U', 'z-BB/TB',
    ])
    expect(lembar).toHaveLength(3)
    expect(lembar[1][1]).toBe('Ani')
    expect(lembar[1][0]).toBe(1)
    expect(lembar[2][0]).toBe(2)
    expect(lembar[2][5]).toBeNull()
  })
})

describe('buatWorkbookRekap', () => {
  it('menghasilkan workbook dengan sheet Rekap 2026 (pertama) & Rincian', async () => {
    const wb = await buatWorkbookRekap([], [], 2026, baris)
    expect(wb.SheetNames).toEqual(['Rekapitulasi 2026', 'Rincian'])
    const buffer = XLSX.write(wb, { type: 'buffer' })
    const dibaca = XLSX.read(buffer)
    expect(dibaca.SheetNames).toEqual(['Rekapitulasi 2026', 'Rincian'])
    const rekapSheet = dibaca.Sheets['Rekapitulasi 2026']
    expect(rekapSheet['A1'].v).toBe('Bulan')
    const rincian = dibaca.Sheets['Rincian']
    expect(rincian['A1'].v).toBe('No')
    expect(rincian['B2'].v).toBe('Ani')
  })
})

describe('teksCsvRincian', () => {
  it('berisi header "Nama" dan nama balita; nilai null menjadi string kosong', async () => {
    const csv = await teksCsvRincian(baris)
    expect(csv).toContain('Nama')
    expect(csv).toContain('Ani')
    expect(csv).toContain('Budi')
    expect(csv).toContain('2,Budi')
    expect(csv).toContain('2024-02-10,,,')
  })
})
