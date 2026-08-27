import { describe, expect, it } from 'vitest'
import { susunIsiKunjungan, type Bumil, type InputKunjunganBumil } from './db'

function buatBumil(ubah: Partial<Bumil> = {}): Bumil {
  return {
    id: 3,
    nama: 'Ibu Hamil',
    nik: null,
    tanggal_lahir: null,
    umur: '25 th',
    nama_suami: 'Pak Suami',
    nomor_kk: null,
    alamat: null,
    dusun: 'Tengah',
    hamil_anak_ke: null,
    jarak_dengan_anak_sebelumnya: null,
    tanggal_bersalin: null,
    tempat_bersalin: null,
    cara_persalin: null,
    anak_ke: null,
    kategori: 'Hamil',
    created_at: '',
    ...ubah,
  }
}

describe('susunIsiKunjungan bumil', () => {
  it('menyimpan identitas, kategori, dan semua isian kunjungan', () => {
    const input: InputKunjunganBumil = {
      tanggal_kunjungan: '2026-01-05',
      kategori: 'Menyusui',
      usia_kehamilan_minggu: 0,
      berat_badan: 52,
      bb_sesuai_kurva_kia: 'Sesuai',
      lingkaran_lengan_atas: 24,
      lila_hijau_merah: 'Hijau',
      tekanan_darah: '110/70',
      td_sesuai_kurva_kia: 'Normal',
      batuk_terus_menerus: 'Ya',
      demam_lebih_dua_minggu: 'Tidak',
      bb_tidak_naik_dua_bulan: 'Tidak',
      kontak_tbc: 'Tidak',
      dapat_tablet_ttd: 'Ya',
      konsumsi_ttd: 'Ya',
      mt_kek_diberikan: 'Ya',
      konsumsi_mt_kek: 'Ya',
      kelas_bumil: 'Ya',
      vitamin_a: 'Ya',
      kb_pasca_persalinan: 'Ya',
      dapat_edukasi: 'Ya',
      dirujuk: 'Tidak',
    }
    const isi = susunIsiKunjungan(buatBumil(), input)

    expect(isi.bumil_id).toBe(3)
    expect(isi.nama).toBe('Ibu Hamil')
    expect(isi.tanggal_kunjungan).toBe('2026-01-05')
    expect(isi.kategori).toBe('Menyusui')
    expect(isi.usia_kehamilan_minggu).toBe(0)
    expect(isi.berat_badan).toBe(52)
    expect(isi.bb_sesuai_kurva_kia).toBe('Sesuai')
    expect(isi.lingkaran_lengan_atas).toBe(24)
    expect(isi.lila_hijau_merah).toBe('Hijau')
    expect(isi.tekanan_darah).toBe('110/70')
    expect(isi.td_sesuai_kurva_kia).toBe('Normal')
    expect(isi.batuk_terus_menerus).toBe('Ya')
    expect(isi.demam_lebih_dua_minggu).toBe('Tidak')
    expect(isi.bb_tidak_naik_dua_bulan).toBe('Tidak')
    expect(isi.kontak_tbc).toBe('Tidak')
    expect(isi.dapat_tablet_ttd).toBe('Ya')
    expect(isi.konsumsi_ttd).toBe('Ya')
    expect(isi.mt_kek_diberikan).toBe('Ya')
    expect(isi.konsumsi_mt_kek).toBe('Ya')
    expect(isi.kelas_bumil).toBe('Ya')
    expect(isi.vitamin_a).toBe('Ya')
    expect(isi.kb_pasca_persalinan).toBe('Ya')
    expect(isi.dapat_edukasi).toBe('Ya')
    expect(isi.dirujuk).toBe('Tidak')
  })

  it('mengosongkan isian yang tidak diisi (null-safe)', () => {
    const isi = susunIsiKunjungan(buatBumil(), { tanggal_kunjungan: '2026-01-05', kategori: 'Hamil' })
    expect(isi.usia_kehamilan_minggu).toBeNull()
    expect(isi.berat_badan).toBeNull()
    expect(isi.bb_sesuai_kurva_kia).toBeNull()
    expect(isi.lingkaran_lengan_atas).toBeNull()
    expect(isi.lila_hijau_merah).toBeNull()
    expect(isi.tekanan_darah).toBeNull()
    expect(isi.batuk_terus_menerus).toBeNull()
    expect(isi.konsumsi_ttd).toBeNull()
    expect(isi.kelas_bumil).toBeNull()
    expect(isi.mt_kek_diberikan).toBeNull()
    expect(isi.konsumsi_mt_kek).toBeNull()
    expect(isi.dapat_edukasi).toBeNull()
    expect(isi.dirujuk).toBeNull()
  })

  it('menolak tanggal kunjungan tidak valid', () => {
    expect(() =>
      susunIsiKunjungan(buatBumil(), { tanggal_kunjungan: '2026/01/05', kategori: 'Hamil' }),
    ).toThrow('Tanggal kunjungan tidak valid.')
  })
})