import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  balitaPerluPerhatian,
  kunjunganTerakhir,
  listBalita,
  listBalitaById,
  susunIsiKunjungan,
  type Balita,
  type InputKunjungan,
} from './db'
import { hitungZLil, hitungZLik, klasifikasiLika, klasifikasiLila } from '@/lib/kalkulator'
import { labelStatus } from '@/lib/status'

// Klien Supabase diganti palsu (chainable + thenable) agar lapisan data
// diuji tanpa koneksi; hasil dari `.from()`/`.rpc()` diatur per test.
const palsu = vi.hoisted(() => {
  const orArgs: string[] = []
  const hasilData: { data: unknown; error: unknown } = { data: [], error: null }
  const hasilRpc: { data: unknown; error: unknown } = { data: [], error: null }

  interface Kueri {
    then: (onFulfilled: (h: { data: unknown; error: unknown }) => unknown) => Promise<unknown>
    select: () => Kueri
    order: () => Kueri
    or: (argumen: string) => Kueri
    eq: () => Kueri
    gte: () => Kueri
    lte: () => Kueri
    in: () => Kueri
    maybeSingle: () => Kueri
    single: () => Kueri
    insert: () => Kueri
    update: () => Kueri
    delete: () => Kueri
  }

  function buatKueri(hasil: { data: unknown; error: unknown }): Kueri {
    const kueri: Kueri = {
      then: (onFulfilled) => Promise.resolve(hasil).then(onFulfilled),
      select: () => kueri,
      order: () => kueri,
      or: (argumen) => {
        orArgs.push(argumen)
        return kueri
      },
      eq: () => kueri,
      gte: () => kueri,
      lte: () => kueri,
      in: () => kueri,
      maybeSingle: () => kueri,
      single: () => kueri,
      insert: () => kueri,
      update: () => kueri,
      delete: () => kueri,
    }
    return kueri
  }

  const wajibSupabase = vi.fn(() => ({
    from: () => buatKueri(hasilData),
    rpc: () => buatKueri(hasilRpc),
  }))

  return { wajibSupabase, orArgs, hasilData, hasilRpc }
})

vi.mock('@/supabase/client', () => ({ wajibSupabase: palsu.wajibSupabase }))

function buatBalita(ubah: Partial<Balita> = {}): Balita {
  return {
    id: 7,
    nama: 'Bayi Sehat',
    nik: null,
    jenis_kelamin: 'Laki-laki',
    tanggal_lahir: '2025-01-15',
    tempat_lahir: null,
    anak_ke: null,
    nama_orang_tua: null,
    nik_orang_tua: null,
    nomor_kk: null,
    dusun: 'Kayumas',
    alamat: null,
    bb_lahir: null,
    pb_lahir: null,
    posyandu: 'Coklat 1',
    dibuat_oleh: null,
    created_at: '',
    ...ubah,
  }
}

function buatKunjungan(ubah: Partial<InputKunjungan> = {}): InputKunjungan {
  return { tanggal_kunjungan: '2026-01-15', berat_badan: 9.6, tinggi_badan: 75, ...ubah }
}

beforeEach(() => {
  palsu.hasilData.data = []
  palsu.hasilData.error = null
  palsu.hasilRpc.data = []
  palsu.hasilRpc.error = null
  palsu.orArgs.length = 0
  palsu.wajibSupabase.mockClear()
})

describe('susunIsiKunjungan balita', () => {
  it('menghitung umur, status & z-score WHO lalu menyimpannya sebagai label Indonesia', () => {
    const isi = susunIsiKunjungan(buatBalita(), buatKunjungan())
    expect(isi.balita_id).toBe(7)
    expect(isi.nama_anak).toBe('Bayi Sehat')
    expect(isi.bulan).toBe('JAN')
    expect(isi.umur_bulan).toBe(12) // 2025-01-15 → 2026-01-15
    expect(isi.bb_menurut_umur).toBe('Normal')
    expect(isi.pbtb_menurut_umur).toBe('Normal')
    expect(isi.bb_menurut_pbtb).toBe('Gizi Baik')
    expect(isi.z_bb_u).toBeCloseTo(-0.05, 2)
    expect(isi.z_tb_u).toBeCloseTo(-0.32, 2)
    expect(isi.z_bb_tb).toBeCloseTo(0.12, 2)
  })

  it('membaca jenis kelamin Perempuan sebagai P', () => {
    const isi = susunIsiKunjungan(
      buatBalita({ jenis_kelamin: 'Perempuan', tanggal_lahir: '2025-03-10' }),
      buatKunjungan({ tanggal_kunjungan: '2026-03-10', berat_badan: 9.0, tinggi_badan: 74 }),
    )
    expect(isi.umur_bulan).toBe(12)
    expect(isi.bb_menurut_umur).toBe('Normal')
    expect(isi.pbtb_menurut_umur).toBe('Normal')
    expect(isi.bb_menurut_pbtb).toBe('Gizi Baik')
  })

  it('memetakan status gizi buruk ke label Indonesia', () => {
    const isi = susunIsiKunjungan(buatBalita(), buatKunjungan({ berat_badan: 5.0, tinggi_badan: 70 }))
    expect(isi.bb_menurut_umur).toBe('Sangat Kurang')
    expect(isi.pbtb_menurut_umur).toBe('Pendek')
    expect(isi.bb_menurut_pbtb).toBe('Gizi Buruk')
    expect(isi.z_bb_u).toBeCloseTo(-5.89, 2)
    expect(isi.z_tb_u).toBeCloseTo(-2.42, 2)
  })

  it('menghitung status lingkar kepala & lengan otomatis dari pengukuran', () => {
    const isi = susunIsiKunjungan(
      buatBalita(),
      buatKunjungan({ lingkar_kepala: 46, lingkar_lengan: 16 }),
    )
    expect(isi.status_lingkar_kepala).toBe(labelStatus(klasifikasiLika(hitungZLik('L', 12, 46) ?? 0)))
    expect(isi.status_lingkar_lengan).toBe(labelStatus(klasifikasiLila(hitungZLil('L', 12, 16) ?? 0)))
  })

  it('menyimpan bidang lain apa adanya & mengosongkan yang tidak diisi', () => {
    const isi = susunIsiKunjungan(
      buatBalita(),
      buatKunjungan({
        sakit: 'Ya',
        dirujuk: 'Ya',
        imunisasi: 'Lengkap',
        vitamin_a: 'Ya',
        asi_eksklusif: 'Ya',
        mp_asi: 'Ya',
        obat_cacing: 'Ya',
        bb_naik_tidak: 'Naik',
        ceklis_perkembangan: 'Lengkap',
        gejala_tbc: 'Tidak',
        mt_pangan_lokal: 'Ya',
        edukasi: 'Ya',
      }),
    )
    expect(isi.sakit).toBe('Ya')
    expect(isi.dirujuk).toBe('Ya')
    expect(isi.imunisasi).toBe('Lengkap')
    expect(isi.vitamin_a).toBe('Ya')
    expect(isi.asi_eksklusif).toBe('Ya')
    expect(isi.mp_asi).toBe('Ya')
    expect(isi.obat_cacing).toBe('Ya')
    expect(isi.bb_naik_tidak).toBe('Naik')
    expect(isi.ceklis_perkembangan).toBe('Lengkap')
    expect(isi.gejala_tbc).toBe('Tidak')
    expect(isi.mt_pangan_lokal).toBe('Ya')
    expect(isi.edukasi).toBe('Ya')
  })

  it('tanpa tanggal lahir: umur & status dikosongkan, status lingkar dari input', () => {
    const isi = susunIsiKunjungan(
      buatBalita({ tanggal_lahir: '' }),
      buatKunjungan({ status_lingkar_kepala: 'Normal', status_lingkar_lengan: 'Hijau' }),
    )
    expect(isi.umur_bulan).toBeNull()
    expect(isi.bb_menurut_umur).toBeNull()
    expect(isi.pbtb_menurut_umur).toBeNull()
    expect(isi.bb_menurut_pbtb).toBeNull()
    expect(isi.z_bb_u).toBeNull()
    expect(isi.z_tb_u).toBeNull()
    expect(isi.z_bb_tb).toBeNull()
    expect(isi.status_lingkar_kepala).toBe('Normal')
    expect(isi.status_lingkar_lengan).toBe('Hijau')
  })

  it('menolak kunjungan sebelum tanggal lahir', () => {
    expect(() => susunIsiKunjungan(buatBalita(), buatKunjungan({ tanggal_kunjungan: '2024-12-01' }))).toThrow(
      'Tanggal kunjungan tidak boleh sebelum tanggal lahir.',
    )
  })

  it('menolak tanggal kunjungan tidak valid', () => {
    expect(() =>
      susunIsiKunjungan(buatBalita(), buatKunjungan({ tanggal_kunjungan: '2026/01/15' })),
    ).toThrow('Tanggal kunjungan tidak valid.')
  })

  it('menolak data pengukuran tidak lengkap', () => {
    expect(() => susunIsiKunjungan(buatBalita(), buatKunjungan({ berat_badan: 0 }))).toThrow(
      'Data tidak lengkap',
    )
  })
})

describe('kunjunganTerakhir', () => {
  it('meneruskan data RPC apa adanya', async () => {
    palsu.hasilRpc.data = [{ balita_id: 1, nama: 'Ani' }]
    await expect(kunjunganTerakhir()).resolves.toEqual([{ balita_id: 1, nama: 'Ani' }])
    expect(palsu.wajibSupabase).toHaveBeenCalled()
  })

  it('melempar pesan galat Indonesia bila RPC menolak', async () => {
    palsu.hasilRpc.error = { code: '42501', message: 'RLS menolak', details: '', hint: '' }
    await expect(balitaPerluPerhatian()).rejects.toThrow(
      'Akses ditolak. Hanya admin yang dapat mengubah atau menghapus data ini.',
    )
  })
})

describe('balitaPerluPerhatian', () => {
  it('hanya menyimpan balita dengan status tidak normal di salah satu indikator', async () => {
    palsu.hasilRpc.data = [
      { balita_id: 1, bb_menurut_umur: 'Kurang', pbtb_menurut_umur: null, bb_menurut_pbtb: null },
      { balita_id: 2, bb_menurut_umur: 'Normal', pbtb_menurut_umur: 'Normal', bb_menurut_pbtb: 'Gizi Baik' },
      { balita_id: 3, bb_menurut_umur: 'Normal', pbtb_menurut_umur: 'Sangat Pendek', bb_menurut_pbtb: null },
      { balita_id: 4, bb_menurut_umur: 'Normal', pbtb_menurut_umur: null, bb_menurut_pbtb: 'Gizi Buruk' },
    ]
    const hasil = await balitaPerluPerhatian()
    expect(hasil.map((k) => k.balita_id)).toEqual([1, 3, 4])
  })
})

describe('listBalita', () => {
  it('tanpa pencarian: mengembalikan data tanpa filter .or()', async () => {
    palsu.hasilData.data = [buatBalita()]
    await expect(listBalita()).resolves.toHaveLength(1)
    expect(palsu.orArgs).toHaveLength(0)
  })

  it('meng-escape karakter khusus ILIKE pada kata kunci', async () => {
    await listBalita('wil%_')
    expect(palsu.orArgs[0]).toContain('wil\\%\\_')
  })

  it('membuang koma & kurung yang bisa memecah query .or()', async () => {
    await listBalita('(alif, budi)')
    const argumen = palsu.orArgs[0]
    expect(argumen).toContain('alif budi')
    expect(argumen).not.toContain('(alif')
    expect(argumen).not.toContain('alif,')
    expect(argumen).not.toContain(',bud')
    expect(argumen).not.toContain('budi)')
  })
})

describe('listBalitaById', () => {
  it('kembali kosong tanpa menyentuh DB bila daftar id kosong', async () => {
    await expect(listBalitaById([])).resolves.toEqual([])
    expect(palsu.wajibSupabase).not.toHaveBeenCalled()
  })
})