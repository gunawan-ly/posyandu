import { describe, expect, it } from 'vitest'
import type { Apras, KunjunganApras } from '../apras/db'
import { gabungAnakApras, gabungKunjunganApras } from '../apras/rekap'
import type { Balita, Kunjungan } from './db'
import {
  filterKunjunganPeriode,
  filterKunjunganRentang,
  gabungAnakBalita,
  gabungKunjunganBalita,
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
    sakit: null,
    dirujuk: null,
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

// Helper rekap gabungan: bungkus daftar balita & kunjungan ke bentuk gabungan.
function hitung(kList: Kunjungan[], bList: Balita[], periode: Parameters<typeof hitungRekapBulanan>[2]) {
  return hitungRekapBulanan(kList.map(gabungKunjunganBalita), bList.map(gabungAnakBalita), periode)
}

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

  const hasil = hitung(kunjungan, balita, { bulan: 1, tahun: 2026 })

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
    const r = hitung(kList, bList, { bulan: 1, tahun: 2026 })
    expect(r.bb_naik).toBe(1)
    expect(r.bb_tidak_naik).toBe(1)
  })

  it('BB naik tetap mengenali nilai legacy Y/T', () => {
    const bList = [buatBalita({ id: 21, nama: 'Imel', tanggal_lahir: '2024-01-10' })]
    const kList = [
      buatKunjungan({ id: 31, balita_id: 21, tanggal_kunjungan: '2026-02-05', bb_naik_tidak: 'Y' }),
      buatKunjungan({ id: 32, balita_id: 21, tanggal_kunjungan: '2026-02-20', bb_naik_tidak: 'T' }),
    ]
    const r = hitung(kList, bList, { bulan: 1, tahun: 2026 })
    // Satu suara per balita: kunjungan terakhir (id 32, 'T') yang dipakai.
    expect(r.bb_naik).toBe(0)
    expect(r.bb_tidak_naik).toBe(1)
  })

  it('menghitung status indikator (kosong tidak masuk hitungan)', () => {
    expect(hasil.bbu_normal).toBe(1)
    expect(hasil.bbu_tidak_normal).toBe(2)
    expect(hasil.tbu_normal).toBe(2)
    expect(hasil.tbu_tidak_normal).toBe(1)
    expect(hasil.bbtb_normal).toBe(2) // "Gizi Baik" dianggap Normal
    expect(hasil.bbtb_tidak_normal).toBe(1)
    // LiKA kunjungan id 3 bernilai null → tidak dihitung di kedua kolom.
    expect(hasil.lika_normal).toBe(1)
    expect(hasil.lika_tidak_normal).toBe(1)
    expect(hasil.lila_normal).toBe(2)
    expect(hasil.lila_tidak_normal).toBe(1)
  })

  it('menghitung layanan (kosong/tak diisi tidak masuk hitungan)', () => {
    // Kunjungan id 2: imunisasi/vitamin/obat_cacing null → dilewati.
    // Kunjungan id 3: ASI/MP-ASI/edukasi null → dilewati.
    expect(hasil.imunisasi_ya).toBe(1)
    expect(hasil.imunisasi_tidak).toBe(1)
    expect(hasil.vitamin_ya).toBe(2)
    expect(hasil.vitamin_tidak).toBe(0)
    expect(hasil.asi_ya).toBe(1)
    expect(hasil.asi_tidak).toBe(1)
    expect(hasil.mpasi_ya).toBe(1)
    expect(hasil.mpasi_tidak).toBe(1)
    expect(hasil.cacing_ya).toBe(2)
    expect(hasil.cacing_tidak).toBe(0)
    expect(hasil.edukasi_ya).toBe(1)
    expect(hasil.edukasi_tidak).toBe(1)
  })

  it('periode rentang menghasilkan sasaran & kehadiran yang sama', () => {
    const hasilRentang = hitung(kunjungan, balita, { awal: '2026-02-01', akhir: '2026-02-28' })
    expect(hasilRentang.sasaran_bayi).toBe(2)
    expect(hasilRentang.sasaran_balita).toBe(3)
    expect(hasilRentang.bayi_hadir).toBe(1)
    expect(hasilRentang.bayi_tidak_hadir).toBe(1)
    expect(hasilRentang.balita_hadir).toBe(2)
    expect(hasilRentang.balita_tidak_hadir).toBe(1)
  })

  it('kunjungan hanya dihitung pada bulan yang tepat (tidak bocor ke bulan lain)', () => {
    // Ani (bayi) kunjungan di Januari saja; Budi (balita) kunjungan di Februari saja.
    const bList = [
      buatBalita({ id: 10, nama: 'Ani', tanggal_lahir: '2025-07-10' }),  // bayi
      buatBalita({ id: 11, nama: 'Budi', tanggal_lahir: '2024-02-10' }), // balita
    ]
    const kList = [
      buatKunjungan({ id: 100, balita_id: 10, tanggal_kunjungan: '2026-01-15', imunisasi: 'Ya' }),
      buatKunjungan({ id: 101, balita_id: 11, tanggal_kunjungan: '2026-02-10', imunisasi: 'Ya' }),
    ]

    // Januari: hanya Ani hadir
    const jan = hitung(kList, bList, { bulan: 0, tahun: 2026 })
    expect(jan.bayi_hadir).toBe(1)
    expect(jan.balita_hadir).toBe(0)
    expect(jan.bayi_tidak_hadir).toBe(0) // Ani (satu-satunya bayi) hadir di Jan
    expect(jan.balita_tidak_hadir).toBe(1) // Budi tidak hadir di Jan
    expect(jan.imunisasi_ya).toBe(1) // hanya Ani

    // Februari: hanya Budi hadir
    const feb = hitung(kList, bList, { bulan: 1, tahun: 2026 })
    expect(feb.bayi_hadir).toBe(0) // Ani tidak kunjungan di Feb
    expect(feb.balita_hadir).toBe(1)
    expect(feb.bayi_tidak_hadir).toBe(1) // Ani (bayi) tidak hadir di Feb
    expect(feb.balita_tidak_hadir).toBe(0) // Budi hadir
    expect(feb.imunisasi_ya).toBe(1) // hanya Budi

    // Maret: tidak ada kunjungan sama sekali
    const mar = hitung(kList, bList, { bulan: 2, tahun: 2026 })
    expect(mar.bayi_hadir).toBe(0)
    expect(mar.balita_hadir).toBe(0)
    expect(mar.bayi_tidak_hadir).toBe(1)
    expect(mar.balita_tidak_hadir).toBe(1)
    expect(mar.imunisasi_ya).toBe(0)
  })

  it('anak dengan kunjungan di dua bulan berbeda dihitung hadir di kedua bulan', () => {
    const bList = [
      buatBalita({ id: 20, nama: 'Citra', tanggal_lahir: '2024-06-10' }), // balita
    ]
    const kList = [
      buatKunjungan({ id: 200, balita_id: 20, tanggal_kunjungan: '2026-03-05', imunisasi: 'Ya' }),
      buatKunjungan({ id: 201, balita_id: 20, tanggal_kunjungan: '2026-05-10', imunisasi: 'Ya' }),
    ]

    const mar = hitung(kList, bList, { bulan: 2, tahun: 2026 })
    expect(mar.balita_hadir).toBe(1)
    expect(mar.imunisasi_ya).toBe(1)

    const mei = hitung(kList, bList, { bulan: 4, tahun: 2026 })
    expect(mei.balita_hadir).toBe(1)
    expect(mei.imunisasi_ya).toBe(1)

    // April: tidak ada kunjungan
    const apr = hitung(kList, bList, { bulan: 3, tahun: 2026 })
    expect(apr.balita_hadir).toBe(0)
    expect(apr.imunisasi_ya).toBe(0)
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

  it('menandai modul Balita pada baris rincian balita', () => {
    const b = buatBalita({ id: 1, nama: 'Budi', tanggal_lahir: '2024-06-10' })
    const k = buatKunjungan({ id: 10, balita_id: 1, tanggal_kunjungan: '2026-02-15' })
    expect(susunBarisRekap(b, k).modul).toBe('Balita')
  })
})

// ---- Gabungan lintas modul: Apras masuk keranjang Balita (v2.32.0) ----

function buatKunjunganApras(partial: Partial<KunjunganApras> & { id: number; apras_id: number | null }): KunjunganApras {
  return {
    nama_anak: null,
    umur_bulan: null,
    tanggal_kunjungan: null,
    berat_badan: null,
    tinggi_badan: null,
    lingkar_kepala: null,
    lingkar_lengan: null,
    gejala_tbc: null,
    obat_cacing: null,
    edukasi: null,
    dirujuk: null,
    catatan: null,
    dibuat_oleh: null,
    created_at: '',
    ...partial,
  }
}

function buatApras(partial: Partial<Apras> & { id: number; nama: string; tanggal_lahir: string }): Apras {
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
    posyandu: null,
    dibuat_oleh: null,
    created_at: '',
    ...partial,
  }
}

describe('rekap gabungan Apras', () => {
  it('anak apras (umur >60 bln) terhitung dalam sasaran & kehadiran Balita', () => {
    // Lahir 2020-06-01 → ~68 bulan pada Feb 2026.
    const anakApras = buatApras({ id: 1, nama: 'Raka', tanggal_lahir: '2020-06-01' })
    const kunjunganApras = [buatKunjunganApras({ id: 1, apras_id: 1, tanggal_kunjungan: '2026-02-09' })]

    const hasil = hitungRekapBulanan(
      [gabungKunjunganApras(kunjunganApras[0])],
      [gabungAnakApras(anakApras)],
      { bulan: 1, tahun: 2026 },
    )
    expect(hasil.sasaran_balita).toBe(1)
    expect(hasil.sasaran_bayi).toBe(0)
    expect(hasil.balita_hadir).toBe(1)
    expect(hasil.balita_tidak_hadir).toBe(0)
  })

  it('kunjungan apras hanya menyumbang indikator yang dimiliki (cacing & edukasi)', () => {
    const anakApras = buatApras({ id: 1, nama: 'Raka', tanggal_lahir: '2020-06-01' })
    const ks = [
      buatKunjunganApras({ id: 1, apras_id: 1, tanggal_kunjungan: '2026-02-09', obat_cacing: 'Ya', edukasi: 'Ya' }),
    ]
    const hasil = hitungRekapBulanan(
      ks.map(gabungKunjunganApras),
      [gabungAnakApras(anakApras)],
      { bulan: 1, tahun: 2026 },
    )
    expect(hasil.cacing_ya).toBe(1)
    expect(hasil.edukasi_ya).toBe(1)
    // Kolom yang tidak ada di apras tetap nol — kosong tak dihitung.
    expect(hasil.imunisasi_ya).toBe(0)
    expect(hasil.imunisasi_tidak).toBe(0)
    expect(hasil.vitamin_ya).toBe(0)
    expect(hasil.bb_naik).toBe(0)
  })

  it('id sama antar tabel tidak saling menimpa (kunci berprefiks modul)', () => {
    // Balita id=1 dan Apras id=1 adalah dua anak berbeda.
    const b = buatBalita({ id: 1, nama: 'Ani', tanggal_lahir: '2025-06-15' }) // bayi
    const a = buatApras({ id: 1, nama: 'Raka', tanggal_lahir: '2020-06-01' }) // apras
    const ks = [
      ...[buatKunjungan({ id: 1, balita_id: 1, tanggal_kunjungan: '2026-02-05', obat_cacing: 'Ya' })].map(gabungKunjunganBalita),
      ...[buatKunjunganApras({ id: 1, apras_id: 1, tanggal_kunjungan: '2026-02-06', obat_cacing: 'Ya' })].map(gabungKunjunganApras),
    ]
    const hasil = hitungRekapBulanan(ks, [gabungAnakBalita(b), gabungAnakApras(a)], { bulan: 1, tahun: 2026 })
    // Kedua anak hadir masing-masing satu suara.
    expect(hasil.bayi_hadir).toBe(1)
    expect(hasil.balita_hadir).toBe(1)
    expect(hasil.cacing_ya).toBe(2)
  })
})