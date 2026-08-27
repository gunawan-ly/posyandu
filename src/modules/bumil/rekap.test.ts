import { describe, expect, it } from 'vitest'
import { hitungRekapTahunan, type KunjunganRekap } from './rekap'

// Pabrik data singkat: kunjungan ibu hamil (default) pada tanggal tertentu.
function kun(overrides: Partial<KunjunganRekap>): KunjunganRekap {
  return {
    bumil_id: 1,
    tanggal_kunjungan: '2026-01-05',
    berat_badan: null,
    bb_sesuai_kurva_kia: null,
    lingkaran_lengan_atas: null,
    lila_hijau_merah: null,
    tekanan_darah: null,
    td_sesuai_kurva_kia: null,
    batuk_terus_menerus: null,
    demam_lebih_dua_minggu: null,
    bb_tidak_naik_dua_bulan: null,
    dapat_tablet_ttd: null,
    konsumsi_ttd: null,
    mt_kek_diberikan: null,
    konsumsi_mt_kek: null,
    kelas_bumil: null,
    vitamin_a: null,
    kb_pasca_persalinan: null,
    dapat_edukasi: null,
    dirujuk: null,
    ...overrides,
  }
}

const ID_HAMIL = { id: 1, kategori: 'Hamil', created_at: '2025-12-01T00:00:00Z' }
const ID_MENYUSUI = { id: 2, kategori: 'Menyusui', created_at: '2026-03-10T00:00:00Z' }
const ID_NIFAS = { id: 3, kategori: 'Nifas', created_at: '2026-05-01T00:00:00Z' }

describe('hitungRekapTahunan', () => {
  it('sasaran dihitung sejak terdaftar; belum terdaftar = 0', () => {
    const hasil = hitungRekapTahunan([ID_HAMIL, ID_MENYUSUI], [], 2026)
    // Ibu hamil terdaftar akhir 2025 → sasaran Jan–Des penuh.
    expect(hasil[0].sasaranHamil).toBe(1)
    expect(hasil[11].sasaranHamil).toBe(1)
    // Ibu menyusui terdaftar Maret 2026 → Jan & Feb masih 0.
    expect(hasil[0].sasaranMenyusui).toBe(0)
    expect(hasil[2].sasaranMenyusui).toBe(1)
  })

  it('datang distinct per ibu; tidak datang = sasaran - datang', () => {
    const ks = [
      kun({ bumil_id: 1, tanggal_kunjungan: '2026-02-02' }),
      kun({ bumil_id: 1, tanggal_kunjungan: '2026-02-16' }),
    ]
    const hasil = hitungRekapTahunan([ID_HAMIL], ks, 2026)
    expect(hasil[1].datangHamil).toBe(1) // dua kunjungan satu ibu tetap 1
    expect(hasil[1].tidakDatangHamil).toBe(0)
    expect(hasil[0].datangHamil).toBe(0)
    expect(hasil[0].tidakDatangHamil).toBe(1)
  })

  it('pemetaan BB/TD/LiLA ke hijau-merah hanya saat nilai terisi', () => {
    const ks = [
      kun({ berat_badan: 55, bb_sesuai_kurva_kia: 'Sesuai', tekanan_darah: '110/70', td_sesuai_kurva_kia: 'Normal' }),
      kun({ berat_badan: 48, bb_sesuai_kurva_kia: 'Tidak Sesuai', lingkaran_lengan_atas: 21, lila_hijau_merah: 'Merah' }),
      kun({ lingkaran_lengan_atas: 24, lila_hijau_merah: 'Hijau', tekanan_darah: '130/90', td_sesuai_kurva_kia: 'Tinggi' }),
      kun({ bb_sesuai_kurva_kia: 'Sesuai' }), // BB kosong → tidak masuk hitungan
    ]
    const b = hitungRekapTahunan([ID_HAMIL], ks, 2026)[0]
    expect(b.bbHijau).toBe(1)
    expect(b.bbMerah).toBe(1)
    expect(b.tdHijau).toBe(1)
    expect(b.tdMerah).toBe(1)
    expect(b.lilaHijau).toBe(1)
    expect(b.lilaMerah).toBe(1)
  })

  it('bergejala TBC hanya saat memenuhi minimal 2 gejala skrining', () => {
    const ks = [
      kun({ batuk_terus_menerus: 'Ya', demam_lebih_dua_minggu: 'Ya' }), // 2 gejala ✓
      kun({ batuk_terus_menerus: 'Ya', kontak_tbc: 'Ya' }), // 1 gejala + kontak ✗
      kun({ batuk_terus_menerus: 'Ya', demam_lebih_dua_minggu: 'Ya', bb_tidak_naik_dua_bulan: 'Ya' }), // 3 ✓
    ]
    const b = hitungRekapTahunan([ID_HAMIL], ks, 2026)[0]
    expect(b.bergejalaTbc).toBe(2)
  })

  it('TTD & PMT: dapat + konsumsi dipetakan Setiap Hari (Ya) / Tidak', () => {
    const ks = [
      kun({ dapat_tablet_ttd: 'Ya', konsumsi_ttd: 'Ya', mt_kek_diberikan: 'Ya', konsumsi_mt_kek: 'Ya' }),
      kun({ dapat_tablet_ttd: 'Ya', konsumsi_ttd: 'Tidak', mt_kek_diberikan: 'Ya', konsumsi_mt_kek: 'Tidak' }),
      kun({ dapat_tablet_ttd: 'Tidak' }),
    ]
    const b = hitungRekapTahunan([ID_HAMIL], ks, 2026)[0]
    expect(b.ttdDapat).toBe(2)
    expect(b.ttdSetiapHari).toBe(1)
    expect(b.ttdTidak).toBe(1)
    expect(b.pmtDapat).toBe(2)
    expect(b.pmtSetiapHari).toBe(1)
    expect(b.pmtTidak).toBe(1)
  })

  it('vitamin A nifas, KB pasca persalinan, kelas & edukasi terhitung per nilai', () => {
    const ks = [
      kun({ bumil_id: 2, tanggal_kunjungan: '2026-04-08', vitamin_a: 'Ya', kb_pasca_persalinan: 'Ya', dapat_edukasi: 'Ya' }),
      kun({ kelas_bumil: 'Ya', dapat_edukasi: 'Ya' }),
      kun({ kelas_bumil: 'Tidak', vitamin_a: 'Tidak' }),
    ]
    const hasil = hitungRekapTahunan([ID_HAMIL, ID_MENYUSUI], ks, 2026)
    const apr = hasil[3]
    expect(apr.vitAYa).toBe(1)
    expect(apr.kbYa).toBe(1)
    const jan = hasil[0]
    expect(jan.kelasYa).toBe(1)
    expect(jan.kelasTidak).toBe(1)
    expect(jan.edukasi).toBe(1)
    expect(apr.edukasi).toBe(1)
    expect(jan.vitATidak).toBe(1)
  })

  it('rujuk dibagi sesuai kategori ibu (hamil vs nifas/menyusui)', () => {
    const ks = [
      kun({ bumil_id: 1, dirujuk: 'Ya' }), // ibu hamil
      kun({ bumil_id: 2, tanggal_kunjungan: '2026-05-02', dirujuk: 'Ya' }), // menyusui
    ]
    const hasil = hitungRekapTahunan([ID_HAMIL, ID_MENYUSUI], ks, 2026)
    expect(hasil[0].rujukHamil).toBe(1)
    expect(hasil[4].rujukMenyusui).toBe(1)
  })

  it('kunjungan tahun lain tidak ikut terhitung', () => {
    const ks = [kun({ tanggal_kunjungan: '2025-06-01', dapat_tablet_ttd: 'Ya' })]
    const hasil = hitungRekapTahunan([ID_HAMIL], ks, 2026)
    expect(hasil.every((b) => b.ttdDapat === 0)).toBe(true)
  })

  it('kategori Nifas diperlakukan sama seperti Menyusui', () => {
    const ks = [
      kun({ bumil_id: 3, tanggal_kunjungan: '2026-05-10', vitamin_a: 'Ya', dirujuk: 'Ya' }),
    ]
    const hasil = hitungRekapTahunan([ID_NIFAS], ks, 2026)
    // Nifas terdaftar Mei 2026 → sasaranMenyusui mulai Mei
    expect(hasil[4].sasaranMenyusui).toBe(1)
    expect(hasil[3].sasaranMenyusui).toBe(0)
    // Vitamin A nifas & rujuk masuk kolom Menyusui
    expect(hasil[4].vitAYa).toBe(1)
    expect(hasil[4].rujukMenyusui).toBe(1)
  })
})
