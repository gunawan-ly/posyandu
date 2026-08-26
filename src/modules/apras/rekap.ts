// Mapper data Apras ke bentuk gabungan Rekap Balita (v2.32.0):
// anak Apras (>60 bulan) ikut terhitung dalam keranjang "Balita" pada
// rekap tahunan/bulanan. Kolom yang tidak dimiliki kunjungan Apras
// (imunisasi, vitamin A, ASI, MP-ASI, ceklis, BB naik, status z-score)
// diisi null — aturan baku rekap otomatis melewatinya.
import type { AnakGabungan, KunjunganGabungan } from '@/modules/balita/rekap'
import type { Apras, KunjunganApras } from './db'

export function gabungAnakApras(a: Pick<Apras, 'id' | 'tanggal_lahir'>): AnakGabungan {
  return { kunci: `apras:${a.id}`, tanggal_lahir: a.tanggal_lahir }
}

export function gabungKunjunganApras(k: KunjunganApras): KunjunganGabungan {
  return {
    kunci: `apras:${k.id}`,
    anakKunci: k.apras_id != null ? `apras:${k.apras_id}` : '',
    tanggal_kunjungan: k.tanggal_kunjungan,
    ceklis_perkembangan: null,
    bb_naik_tidak: null,
    bb_menurut_umur: null,
    pbtb_menurut_umur: null,
    bb_menurut_pbtb: null,
    status_lingkar_kepala: null,
    status_lingkar_lengan: null,
    imunisasi: null,
    vitamin_a: null,
    asi_eksklusif: null,
    mp_asi: null,
    obat_cacing: k.obat_cacing,
    edukasi: k.edukasi,
  }
}
