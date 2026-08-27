import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import type { BarisRekap, PeriodeRekap, RekapBulanan } from './rekap'
import { buatWorkbookRekap, labelPeriode, susunLembarRingkasan, susunLembarRincian, teksCsvRekap } from './ekspor'

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

describe('labelPeriode', () => {
  it('bulan+tahun → nama bulan Indonesia UPPERCASE + tahun', () => {
    const periode: PeriodeRekap = { bulan: 7, tahun: 2026 }
    expect(labelPeriode(periode)).toBe('AGUSTUS 2026')
  })

  it('rentang tanggal → format dd/mm/yyyy dipisah " - "', () => {
    const periode: PeriodeRekap = { awal: '2026-08-01', akhir: '2026-08-31' }
    expect(labelPeriode(periode)).toBe('01/08/2026 - 31/08/2026')
  })

  it('rentang tanggal tidak valid → " - "', () => {
    expect(labelPeriode({ awal: 'bukan-tanggal', akhir: '2026-08-31' })).toBe(' - ')
    expect(labelPeriode({ awal: '', akhir: '' })).toBe(' - ')
  })
})

describe('susunLembarRingkasan', () => {
  it('memuat judul, baris Periode, dan pasangan Keterangan/Jumlah sesuai format', () => {
    const lembar = susunLembarRingkasan(rekap, 'AGUSTUS 2026')
    expect(lembar[0]).toEqual(['REKAP BULANAN POSYANDU - BALITA', ''])
    expect(lembar[1]).toEqual(['Periode', 'AGUSTUS 2026'])
    expect(lembar[3]).toEqual(['Keterangan', 'Jumlah'])
  })

  it('menyisipkan Balita Datang/Tidak Datang tepat setelah Bayi Tidak Datang', () => {
    const lembar = susunLembarRingkasan(rekap, 'AGUSTUS 2026')
    const iBayiTidak = lembar.findIndex((r) => r[0] === 'Bayi Tidak Datang (Tidak Hadir)')
    expect(iBayiTidak).toBeGreaterThan(-1)
    expect(lembar[iBayiTidak + 1]).toEqual(['Balita Datang (Hadir)', 10])
    expect(lembar[iBayiTidak + 2]).toEqual(['Balita Tidak Datang (Tidak Hadir)', 2])
  })

  it('memuat tiap baris keterangan beserta jumlahnya (mis. Jumlah Sasaran - Bayi)', () => {
    const lembar = susunLembarRingkasan(rekap, 'AGUSTUS 2026')
    const barisBayi = lembar.find((r) => r[0] === 'Jumlah Sasaran - Bayi')
    expect(barisBayi).toBeDefined()
    expect(barisBayi?.[1]).toBe(5)
    const barisEdukasi = lembar.find((r) => r[0] === 'Edukasi - Ya')
    expect(barisEdukasi?.[1]).toBe(4)
  })
})

describe('susunLembarRincian', () => {
  it('memuat header kolom lalu satu baris per BarisRekap', () => {
    const lembar = susunLembarRincian(baris)
    expect(lembar[0]).toEqual([
      'No',
      'Nama',
      'Modul',
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
    ])
    expect(lembar).toHaveLength(3)
    expect(lembar[1][1]).toBe('Ani')
    expect(lembar[1][0]).toBe(1)
    expect(lembar[2][0]).toBe(2)
    // Kolom bergeser +1 sejak v2.32.0 (kolom Modul setelah Nama).
    expect(lembar[2][5]).toBeNull()
  })
})

describe('buatWorkbookRekap', () => {
  it('menghasilkan workbook dengan sheet Ringkasan (pertama) & Rincian', async () => {
    const wb = await buatWorkbookRekap(rekap, baris, 'AGUSTUS 2026')
    expect(wb.SheetNames).toEqual(['Ringkasan', 'Rincian'])
    const buffer = XLSX.write(wb, { type: 'buffer' })
    const dibaca = XLSX.read(buffer)
    expect(dibaca.SheetNames).toEqual(['Ringkasan', 'Rincian'])
    const ringkasan = dibaca.Sheets['Ringkasan']
    expect(ringkasan['A1'].v).toBe('REKAP BULANAN POSYANDU - BALITA')
    expect(ringkasan['A2'].v).toBe('Periode')
    expect(ringkasan['B2'].v).toBe('AGUSTUS 2026')
    expect(ringkasan['A4'].v).toBe('Keterangan')
    expect(ringkasan['A5'].v).toBe('Jumlah Sasaran - Bayi')
    expect(ringkasan['B5'].v).toBe(5)
    const rincian = dibaca.Sheets['Rincian']
    expect(rincian['A1'].v).toBe('No')
    expect(rincian['B2'].v).toBe('Ani')
  })
})

describe('teksCsvRekap', () => {
  it('berisi header "Nama" dan nama balita; nilai null menjadi string kosong', async () => {
    const csv = await teksCsvRekap(baris)
    expect(csv).toContain('Nama')
    expect(csv).toContain('Ani')
    expect(csv).toContain('Budi')
    // Baris Budi (No 2) punya umur_bulan null → kolomnya kosong (dua pemisah beruntun).
    expect(csv).toContain('2,Budi')
    expect(csv).toContain('2024-02-10,,,')
  })
})
