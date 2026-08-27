import { describe, expect, it } from 'vitest'
import { susunIsiKunjungan, type Apras, type InputKunjunganApras } from './db'

function buatApras(ubah: Partial<Apras> = {}): Apras {
  return {
    id: 5,
    nama: 'Anak Sehat',
    nik: null,
    jenis_kelamin: 'Perempuan',
    tanggal_lahir: '2020-07-01',
    tempat_lahir: null,
    anak_ke: null,
    nama_orang_tua: null,
    nik_orang_tua: null,
    nomor_kk: null,
    dusun: 'Cempaka',
    alamat: null,
    posyandu: 'Coklat 2',
    dibuat_oleh: null,
    created_at: '',
    ...ubah,
  }
}

describe('susunIsiKunjungan apras', () => {
  it('menghitung umur kalender serta menyimpan identitas & pengukuran', () => {
    const isi = susunIsiKunjungan(
      buatApras(),
      { tanggal_kunjungan: '2025-12-01', berat_badan: 18.4, tinggi_badan: 112 },
    )
    expect(isi.apras_id).toBe(5)
    expect(isi.nama_anak).toBe('Anak Sehat')
    expect(isi.umur_bulan).toBe(65) // 2020-07-01 → 2025-12-01
    expect(isi.berat_badan).toBe(18.4)
    expect(isi.tinggi_badan).toBe(112)
  })

  it('menyimpan isian lain apa adanya & mengosongkan yang tidak diisi', () => {
    const input: InputKunjunganApras = {
      tanggal_kunjungan: '2025-12-01',
      berat_badan: 18.4,
      tinggi_badan: 112,
      lingkar_kepala: 50,
      lingkar_lengan: 17,
      gejala_tbc: 'Tidak',
      obat_cacing: 'Ya',
      edukasi: 'Ya',
      dirujuk: 'Tidak',
      catatan: 'Baik',
    }
    const isi = susunIsiKunjungan(buatApras(), input)
    expect(isi.lingkar_kepala).toBe(50)
    expect(isi.lingkar_lengan).toBe(17)
    expect(isi.gejala_tbc).toBe('Tidak')
    expect(isi.obat_cacing).toBe('Ya')
    expect(isi.edukasi).toBe('Ya')
    expect(isi.dirujuk).toBe('Tidak')
    expect(isi.catatan).toBe('Baik')
  })

  it('mengosongkan pengukuran yang tidak diisi (null-safe)', () => {
    const isi = susunIsiKunjungan(buatApras(), { tanggal_kunjungan: '2025-12-01' })
    expect(isi.umur_bulan).toBe(65)
    expect(isi.berat_badan).toBeNull()
    expect(isi.tinggi_badan).toBeNull()
    expect(isi.lingkar_kepala).toBeNull()
    expect(isi.lingkar_lengan).toBeNull()
    expect(isi.gejala_tbc).toBeNull()
    expect(isi.obat_cacing).toBeNull()
    expect(isi.edukasi).toBeNull()
    expect(isi.dirujuk).toBeNull()
    expect(isi.catatan).toBeNull()
  })

  it('menolak kunjungan sebelum tanggal lahir', () => {
    expect(() =>
      susunIsiKunjungan(buatApras(), { tanggal_kunjungan: '2019-12-01' }),
    ).toThrow('Tanggal kunjungan tidak boleh sebelum tanggal lahir.')
  })

  it('menolak tanggal kunjungan tidak valid', () => {
    expect(() =>
      susunIsiKunjungan(buatApras(), { tanggal_kunjungan: '2025.12.01' }),
    ).toThrow('Tanggal kunjungan tidak valid.')
  })

  it('tanpa tanggal lahir: umur dikosongkan', () => {
    const isi = susunIsiKunjungan(
      buatApras({ tanggal_lahir: '' }),
      { tanggal_kunjungan: '2025-12-01', berat_badan: 18.4 },
    )
    expect(isi.umur_bulan).toBeNull()
    expect(isi.berat_badan).toBe(18.4)
  })
})