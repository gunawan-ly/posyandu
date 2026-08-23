import { describe, expect, it } from 'vitest'
import type { Balita, Kunjungan } from './db'
import {
  filterKunjunganPeriode,
  filterKunjunganRentang,
  hitungRekapBulanan,
  klasifikasiSasaran,
  rekapPerBalita,
  susunBarisRekap,
} from './rekap'

// Helper membuat objek Kunjungan lengkap (data fiktif untuk test).
function buatKunjungan(partial: Partial<Kunjungan> & { id: number; balita_id: number | null }): Kunjungan {
  return {
    nama_anak: null,
    bulan: null,
    tanggal_kunjungan: null,
    ceklis_perkembangan: null,
    berat_badan: null,
    bb_naik_tidak: null,
    bb_menurut_umur: null,
    tinggi_badan: null,
    pbtb_menurut_umur: null,
    bb_menurut_pbtb: null,
    lingkar_kepala: null,
    status_lingkar_kepala: null,
    lingkar_lengan: null,
    status_lingkar_lengan: null,
    vitamin_a: null,
    gejala_tbc: null,
    asi_eksklusif: null,
    mp_asi: null,
    imunisasi: null,
    obat_cacing: null,
    mt_pangan_lokal: null,
    edukasi: null,
    umur_bulan: null,
    z_bb_u: null,
    z_tb_u: null,
    z_bb_tb: null,
    dibuat_oleh: null,
    created_at: '',
    ...partial,
  }
}

// Helper membuat objek Balita lengkap.
function buatBalita(partial: Partial<Balita> & { id: number; nama: string; tanggal_lahir: string }): Balita {
  return {
    nik: null,
    jenis_kelamin: null,
    tempat_lahir: null,
    anak_ke: null,
    nama_orang_tua: null,
    nik_orang_tua: null,
    nomor_kk: null,
    dusun: null,
    alamat: null,
    bb_lahir: null,
    pb_lahir: null,
    posyandu: null,
    dibuat_oleh: null,
    created_at: '',
    ...partial,
  }
}

describe('filterKunjunganPeriode', () => {
  it('menyaring kunjungan sesuai bulan-tahun termasuk tepi bulan (bulan 0-indexed)', () => {
    const daftar = [
      buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: '2026-01-05' }),
      buatKunjungan({ id: 2, balita_id: 1, tanggal_kunjungan: '2026-01-31' }),
      buatKunjungan({ id: 3, balita_id: 1, tanggal_kunjungan: '2026-02-01' }),
      buatKunjungan({ id: 4, balita_id: 2, tanggal_kunjungan: '2026-01-15' }),
    ]
    const januari = filterKunjunganPeriode(daftar, 0, 2026)
    expect(januari.map((k) => k.id).sort((a, b) => a - b)).toEqual([1, 2, 4])
    const februari = filterKunjunganPeriode(daftar, 1, 2026)
    expect(februari.map((k) => k.id)).toEqual([3])
    expect(filterKunjunganPeriode(daftar, 0, 2025)).toEqual([])
  })

  it('mengabaikan kunjungan dengan tanggal tidak valid', () => {
    const daftar = [buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: 'bukan-tanggal' })]
    expect(filterKunjunganPeriode(daftar, 0, 2026)).toEqual([])
  })
})

describe('filterKunjunganRentang', () => {
  it('menyaring rentang YYYY-MM-DD inklusif (tepi ikut serta)', () => {
    const daftar = [
      buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: '2026-01-09' }),
      buatKunjungan({ id: 2, balita_id: 1, tanggal_kunjungan: '2026-01-10' }),
      buatKunjungan({ id: 3, balita_id: 2, tanggal_kunjungan: '2026-01-15' }),
      buatKunjungan({ id: 4, balita_id: 2, tanggal_kunjungan: '2026-01-20' }),
      buatKunjungan({ id: 5, balita_id: 3, tanggal_kunjungan: '2026-01-21' }),
    ]
    const hasil = filterKunjunganRentang(daftar, '2026-01-10', '2026-01-20')
    expect(hasil.map((k) => k.id).sort((a, b) => a - b)).toEqual([2, 3, 4])
  })

  it('mengembalikan array kosong bila tanggal rentang tidak valid', () => {
    const daftar = [buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: '2026-01-10' })]
    expect(filterKunjunganRentang(daftar, 'tidak-valid', '2026-01-20')).toEqual([])
  })
})

describe('rekapPerBalita', () => {
  it('memilih kunjungan terakhir per balita (tanggal naik, id naik sebagai tiebreak)', () => {
    const daftar = [
      buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: '2026-01-05' }),
      buatKunjungan({ id: 2, balita_id: 1, tanggal_kunjungan: '2026-02-05' }),
      buatKunjungan({ id: 3, balita_id: 1, tanggal_kunjungan: '2026-02-05' }),
      buatKunjungan({ id: 4, balita_id: 2, tanggal_kunjungan: '2026-01-10' }),
      buatKunjungan({ id: 5, balita_id: null, tanggal_kunjungan: '2026-03-01' }),
    ]
    const hasil = rekapPerBalita(daftar)
    expect(hasil.size).toBe(2)
    expect(hasil.get(1)?.id).toBe(3)
    expect(hasil.get(2)?.id).toBe(4)
  })
})

describe('klasifikasiSasaran', () => {
  const ref = new Date(2026, 0, 15) // 15 Januari 2026

  it('umur < 12 bulan diklasifikasi bayi', () => {
    expect(klasifikasiSasaran('2025-07-10', ref)).toBe('bayi')
    expect(klasifikasiSasaran('2025-01-16', ref)).toBe('bayi') // 11 bulan
  })

  it('umur 12 bulan ke atas diklasifikasi balita', () => {
    expect(klasifikasiSasaran('2025-01-15', ref)).toBe('balita') // tepat 12 bulan
    expect(klasifikasiSasaran('2024-02-10', ref)).toBe('balita')
  })

  it('tanggal lahir tidak valid dianggap balita (aman)', () => {
    expect(klasifikasiSasaran('', ref)).toBe('balita')
    expect(klasifikasiSasaran('bukan-tanggal', ref)).toBe('balita')
  })
})

describe('hitungRekapBulanan', () => {
  const balita = [
    buatBalita({ id: 1, nama: 'Ani', tanggal_lahir: '2025-06-15' }), // 8 bulan → bayi
    buatBalita({ id: 2, nama: 'Budi', tanggal_lahir: '2024-02-10' }), // 24 bulan → balita
    buatBalita({ id: 3, nama: 'Citra', tanggal_lahir: '2024-08-20' }), // 18 bulan → balita
    buatBalita({ id: 4, nama: 'Dewi', tanggal_lahir: '2025-05-20' }), // 9 bulan → bayi, tanpa kunjungan
    buatBalita({ id: 5, nama: 'Eko', tanggal_lahir: '2024-06-01' }), // ~20 bulan → balita, tanpa kunjungan
  ]

  const kunjungan = [
    buatKunjungan({
      id: 1,
      balita_id: 1,
      tanggal_kunjungan: '2026-02-10',
      ceklis_perkembangan: 'Y',
      bb_naik_tidak: 'Y',
      bb_menurut_umur: 'Normal',
      pbtb_menurut_umur: 'Normal',
      bb_menurut_pbtb: 'Gizi Baik',
      status_lingkar_kepala: 'Normal',
      status_lingkar_lengan: 'Normal',
      imunisasi: 'Ya',
      vitamin_a: 'Y',
      asi_eksklusif: 'Ya',
      mp_asi: 'T',
      obat_cacing: 'Y',
      edukasi: '1',
    }),
    buatKunjungan({
      id: 2,
      balita_id: 2,
      tanggal_kunjungan: '2026-02-12',
      ceklis_perkembangan: 'T',
      bb_naik_tidak: 'T',
      bb_menurut_umur: 'Kurang',
      pbtb_menurut_umur: 'Pendek',
      bb_menurut_pbtb: 'Gizi Kurang',
      status_lingkar_kepala: 'Mikrosefali',
      status_lingkar_lengan: 'Gizi Kurang',
      imunisasi: null,
      vitamin_a: null,
      asi_eksklusif: 'Tidak',
      mp_asi: 'Ya',
      obat_cacing: null,
      edukasi: 'T',
    }),
    buatKunjungan({
      id: 3,
      balita_id: 3,
      tanggal_kunjungan: '2026-02-14',
      ceklis_perkembangan: 'lengkap',
      bb_naik_tidak: null,
      bb_menurut_umur: 'Risiko Berat Berlebih',
      pbtb_menurut_umur: 'Normal',
      bb_menurut_pbtb: 'Gizi Baik',
      status_lingkar_kepala: null,
      status_lingkar_lengan: 'Normal',
      imunisasi: 'T',
      vitamin_a: 'Ya',
      asi_eksklusif: null,
      mp_asi: null,
      obat_cacing: 'Ya',
      edukasi: null,
    }),
  ]

  const hasil = hitungRekapBulanan(kunjungan, balita, { bulan: 1, tahun: 2026 })

  it('menghitung sasaran & kehadiran (bayi dan balita)', () => {
    expect(hasil.sasaran_bayi).toBe(2)
    expect(hasil.sasaran_balita).toBe(3)
    expect(hasil.bayi_hadir).toBe(1)
    expect(hasil.bayi_tidak_hadir).toBe(1)
    expect(hasil.balita_hadir).toBe(2)
    expect(hasil.balita_tidak_hadir).toBe(1)
  })

  it('menghitung ceklis perkembangan (null dihitung Tidak) & kenaikan BB (kosong dilewati)', () => {
    expect(hasil.ceklis_lengkap).toBe(2)
    expect(hasil.ceklis_tidak_lengkap).toBe(1)
    // BB naik: kunjungan id 3 bernilai null TIDAK dihitung di kedua kolom.
    expect(hasil.bb_naik).toBe(1)
    expect(hasil.bb_tidak_naik).toBe(1)
  })

  it('BB naik mengenali nilai form Naik/Tidak Naik dan melewatkan yang kosong', () => {
    const bList = [
      buatBalita({ id: 11, nama: 'Fajar', tanggal_lahir: '2024-01-10' }),
      buatBalita({ id: 12, nama: 'Gita', tanggal_lahir: '2024-02-10' }),
      buatBalita({ id: 13, nama: 'Hana', tanggal_lahir: '2024-03-10' }),
    ]
    const kList = [
      buatKunjungan({ id: 21, balita_id: 11, tanggal_kunjungan: '2026-02-05', bb_naik_tidak: 'Naik' }),
      buatKunjungan({ id: 22, balita_id: 12, tanggal_kunjungan: '2026-02-06', bb_naik_tidak: 'Tidak Naik' }),
      buatKunjungan({ id: 23, balita_id: 13, tanggal_kunjungan: '2026-02-07', bb_naik_tidak: '' }),
    ]
    const r = hitungRekapBulanan(kList, bList, { bulan: 1, tahun: 2026 })
    expect(r.bb_naik).toBe(1)
    expect(r.bb_tidak_naik).toBe(1)
  })

  it('BB naik tetap mengenali nilai legacy Y/T', () => {
    const bList = [buatBalita({ id: 21, nama: 'Imel', tanggal_lahir: '2024-01-10' })]
    const kList = [
      buatKunjungan({ id: 31, balita_id: 21, tanggal_kunjungan: '2026-02-05', bb_naik_tidak: 'Y' }),
      buatKunjungan({ id: 32, balita_id: 21, tanggal_kunjungan: '2026-02-20', bb_naik_tidak: 'T' }),
    ]
    const r = hitungRekapBulanan(kList, bList, { bulan: 1, tahun: 2026 })
    // Satu suara per balita: kunjungan terakhir (id 32, 'T') yang dipakai.
    expect(r.bb_naik).toBe(0)
    expect(r.bb_tidak_naik).toBe(1)
  })

  it('menghitung status indikator (normal vs tidak normal)', () => {
    expect(hasil.bbu_normal).toBe(1)
    expect(hasil.bbu_tidak_normal).toBe(2)
    expect(hasil.tbu_normal).toBe(2)
    expect(hasil.tbu_tidak_normal).toBe(1)
    expect(hasil.bbtb_normal).toBe(2) // "Gizi Baik" dianggap Normal
    expect(hasil.bbtb_tidak_normal).toBe(1)
    expect(hasil.lika_normal).toBe(1)
    expect(hasil.lika_tidak_normal).toBe(2)
    expect(hasil.lila_normal).toBe(2)
    expect(hasil.lila_tidak_normal).toBe(1)
  })

  it('menghitung layanan (imunisasi, vitamin, ASI, MP-ASI, obat cacing, edukasi)', () => {
    expect(hasil.imunisasi_ya).toBe(1)
    expect(hasil.imunisasi_tidak).toBe(2)
    expect(hasil.vitamin_ya).toBe(2)
    expect(hasil.vitamin_tidak).toBe(1)
    expect(hasil.asi_ya).toBe(1)
    expect(hasil.asi_tidak).toBe(2)
    expect(hasil.mpasi_ya).toBe(1)
    expect(hasil.mpasi_tidak).toBe(2)
    expect(hasil.cacing_ya).toBe(2)
    expect(hasil.cacing_tidak).toBe(1)
    expect(hasil.edukasi_ya).toBe(1)
    expect(hasil.edukasi_tidak).toBe(2)
  })

  it('periode rentang menghasilkan sasaran & kehadiran yang sama', () => {
    const hasilRentang = hitungRekapBulanan(kunjungan, balita, { awal: '2026-02-01', akhir: '2026-02-28' })
    expect(hasilRentang.sasaran_bayi).toBe(2)
    expect(hasilRentang.sasaran_balita).toBe(3)
    expect(hasilRentang.bayi_hadir).toBe(1)
    expect(hasilRentang.bayi_tidak_hadir).toBe(1)
    expect(hasilRentang.balita_hadir).toBe(2)
    expect(hasilRentang.balita_tidak_hadir).toBe(1)
  })
})

describe('susunBarisRekap', () => {
  it('mengisi umur_bulan dari tanggal lahir vs tanggal kunjungan bila kolom kosong', () => {
    const b = buatBalita({
      id: 1,
      nama: 'Budi',
      tanggal_lahir: '2024-06-10',
      jenis_kelamin: 'Laki - Laki',
      dusun: 'Wapalo',
      posyandu: 'Posyandu Wapalo',
    })
    const k = buatKunjungan({
      id: 7,
      balita_id: 1,
      tanggal_kunjungan: '2026-02-15',
      berat_badan: 9.5,
      tinggi_badan: 80,
      bb_menurut_umur: 'Normal',
      pbtb_menurut_umur: 'Normal',
      bb_menurut_pbtb: 'Gizi Baik',
      status_lingkar_kepala: 'Normal',
      status_lingkar_lengan: 'Normal',
      z_bb_u: -0.5,
      z_tb_u: 0.2,
      z_bb_tb: -0.1,
      umur_bulan: null,
    })
    const baris = susunBarisRekap(b, k)
    expect(baris.umur_bulan).toBe(20)
    expect(baris.nama).toBe('Budi')
    expect(baris.jenis_kelamin).toBe('Laki - Laki')
    expect(baris.tanggal_lahir).toBe('2024-06-10')
    expect(baris.dusun).toBe('Wapalo')
    expect(baris.posyandu).toBe('Posyandu Wapalo')
    expect(baris.tanggal_kunjungan).toBe('2026-02-15')
    expect(baris.berat_badan).toBe(9.5)
    expect(baris.tinggi_badan).toBe(80)
    expect(baris.bb_menurut_umur).toBe('Normal')
    expect(baris.pbtb_menurut_umur).toBe('Normal')
    expect(baris.bb_menurut_pbtb).toBe('Gizi Baik')
    expect(baris.status_lingkar_kepala).toBe('Normal')
    expect(baris.status_lingkar_lengan).toBe('Normal')
    expect(baris.z_bb_u).toBeCloseTo(-0.5, 5)
    expect(baris.z_tb_u).toBeCloseTo(0.2, 5)
    expect(baris.z_bb_tb).toBeCloseTo(-0.1, 5)
  })

  it('memakai umur_bulan tersimpan bila ada', () => {
    const b = buatBalita({ id: 1, nama: 'Budi', tanggal_lahir: '2024-06-10' })
    const k = buatKunjungan({ id: 8, balita_id: 1, tanggal_kunjungan: '2026-02-15', umur_bulan: 18 })
    expect(susunBarisRekap(b, k).umur_bulan).toBe(18)
  })

  it('mengembalikan umur_bulan null bila tidak bisa dihitung', () => {
    const b = buatBalita({ id: 1, nama: 'Budi', tanggal_lahir: '' })
    const k = buatKunjungan({ id: 9, balita_id: 1, tanggal_kunjungan: '2026-02-15', umur_bulan: null })
    expect(susunBarisRekap(b, k).umur_bulan).toBeNull()
  })
})