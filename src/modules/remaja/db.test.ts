import { describe, expect, it } from 'vitest'
import { susunIsiKunjungan, type Remaja } from './db'

function buatRemaja(ubah: Partial<Remaja> = {}): Remaja {
  return {
    id: 12,
    nama: 'Remaja Sehat',
    nik: null,
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2009-05-10',
    tempat_lahir: null,
    nama_orang_tua: null,
    nik_orang_tua: null,
    nomor_kk: null,
    dusun: 'Cempaka',
    alamat: null,
    nama_sekolah: 'SMPN 1',
    dibuat_oleh: null,
    created_at: '',
    ...ubah,
  }
}

describe('susunIsiKunjungan remaja', () => {
  it('menghitung umur tahun serta menyimpan identitas, IMT manual & pengukuran', () => {
    const isi = susunIsiKunjungan(
      buatRemaja(),
      {
        tanggal_kunjungan: '2026-08-05',
        berat_badan: 45,
        tinggi_badan: 155,
        imt: '18.7 (N)',
        lingkar_perut: 70,
      },
    )
    expect(isi.remaja_id).toBe(12)
    expect(isi.nama_remaja).toBe('Remaja Sehat')
    // 2009-05-10 → 2026-08-05 = 206 bulan (hari kunjungan < hari lahir) → 17,17 tahun.
    expect(isi.umur_tahun).toBeCloseTo(206 / 12, 2)
    expect(isi.berat_badan).toBe(45)
    expect(isi.tinggi_badan).toBe(155)
    expect(isi.imt).toBe('18.7 (N)')
    expect(isi.lingkar_perut).toBe(70)
  })

  it('menyimpan isian pemeriksaan & skrining apa adanya', () => {
    const isi = susunIsiKunjungan(
      buatRemaja(),
      {
        tanggal_kunjungan: '2026-08-05',
        berat_badan: 45,
        tinggi_badan: 155,
        td_sistole: 110,
        td_diastole: 70,
        td_kategori: 'Normal',
        gula_darah: 95,
        gula_kategori: 'Normal',
        hb: 12,
        anemia: 'Tidak',
        batuk_terus_menerus: 'Ya',
        demam_lebih_dua_minggu: 'Tidak',
        bb_tidak_naik_dua_bulan: 'Tidak',
        kontak_erat_tbc: 'Tidak',
        edukasi: 'Edukasi gizi',
        rujuk: 'Tidak',
        catatan: 'Baik',
      },
    )
    expect(isi.td_sistole).toBe(110)
    expect(isi.td_diastole).toBe(70)
    expect(isi.td_kategori).toBe('Normal')
    expect(isi.gula_darah).toBe(95)
    expect(isi.hb).toBe(12)
    expect(isi.anemia).toBe('Tidak')
    expect(isi.batuk_terus_menerus).toBe('Ya')
    expect(isi.rujuk).toBe('Tidak')
    expect(isi.edukasi).toBe('Edukasi gizi')
    expect(isi.catatan).toBe('Baik')
  })

  it('mengosongkan isian yang tidak diisi (null-safe)', () => {
    const isi = susunIsiKunjungan(
      buatRemaja(),
      { tanggal_kunjungan: '2026-08-05', berat_badan: 45, tinggi_badan: 155 },
    )
    expect(isi.imt).toBeNull()
    expect(isi.lingkar_perut).toBeNull()
    expect(isi.td_sistole).toBeNull()
    expect(isi.gula_darah).toBeNull()
    expect(isi.hb).toBeNull()
    expect(isi.anemia).toBeNull()
    expect(isi.batuk_terus_menerus).toBeNull()
    expect(isi.kontak_erat_tbc).toBeNull()
    expect(isi.edukasi).toBeNull()
    expect(isi.rujuk).toBeNull()
    expect(isi.catatan).toBeNull()
  })

  it('menolak kunjungan sebelum tanggal lahir', () => {
    expect(() =>
      susunIsiKunjungan(buatRemaja(), { tanggal_kunjungan: '2008-12-01' }),
    ).toThrow('Tanggal kunjungan tidak boleh sebelum tanggal lahir.')
  })

  it('menolak tanggal kunjungan tidak valid', () => {
    expect(() =>
      susunIsiKunjungan(buatRemaja(), { tanggal_kunjungan: '2026.08.05' }),
    ).toThrow('Tanggal kunjungan tidak valid.')
  })

  it('tanpa tanggal lahir: umur dikosongkan', () => {
    const isi = susunIsiKunjungan(
      buatRemaja({ tanggal_lahir: '' }),
      { tanggal_kunjungan: '2026-08-05', berat_badan: 45, tinggi_badan: 155 },
    )
    expect(isi.umur_tahun).toBeNull()
    expect(isi.berat_badan).toBe(45)
  })
})
