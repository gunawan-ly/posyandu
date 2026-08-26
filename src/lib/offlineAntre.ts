import { computed, readonly, ref } from 'vue'
import { adalahGalatJaringan } from './galat'
import {
  ambilBalita,
  tambahKunjungan,
  type InputKunjungan,
} from '@/modules/balita/db'
import {
  ambilBumil,
  tambahKunjunganBumil,
  type InputKunjunganBumil,
} from '@/modules/bumil/db'
import {
  ambilApras,
  tambahKunjunganApras,
  type InputKunjunganApras,
} from '@/modules/apras/db'

// Antrean offline untuk pencatatan kunjungan saat sinyal hilang:
// - Form menyimpan INPUT MENTAH ke localStorage (bukan hasil hitung) agar
//   status/z-score dihitung ulang dengan alur kode yang sama saat sync.
// - Sync FIFO otomatis saat kembali online / aplikasi dibuka / manual.
// - Item dengan galat non-jaringan ditandai `gagal` dan tetap di antre
//   supaya kader bisa memeriksanya; galat jaringan menghentikan sync.

export type ModulAntre = 'balita' | 'bumil' | 'apras'

export interface AntreKunjungan {
  uid: string
  modul: ModulAntre
  identitasId: number
  nama: string
  tanggal_kunjungan: string
  dibuat: string
  gagal?: boolean
  isi: Record<string, unknown>
}

const KUNCI_PENYIMPANAN = 'posyandu-antre-kunjungan'

// Antarmuka minimal agar aman dari implementasi Storage yang tidak lengkap
// (beberapa runtime/webview menyuntikkan objek localStorage tanpa metode).
interface PenyimpananMinimal {
  getItem(kunci: string): string | null
  setItem(kunci: string, nilai: string): void
}

function cariBackend(): PenyimpananMinimal | null {
  try {
    if (typeof window === 'undefined') return null
    const kandidat = (window as unknown as { localStorage?: PenyimpananMinimal | null }).localStorage
    if (kandidat && typeof kandidat.getItem === 'function' && typeof kandidat.setItem === 'function') {
      return kandidat
    }
  } catch {
    // Akses localStorage bisa melempar (mode privat) — perlakukan sebagai absen.
  }
  return null
}

// Cadangan dalam sesi bila penyimpanan perangkat tidak tersedia — antrean
// tetap berfungsi selama halaman tidak dimuat ulang.
let jsonCadangan: string | null = null

function bacaJson(): string | null {
  const backend = cariBackend()
  if (!backend) return jsonCadangan
  try {
    return backend.getItem(KUNCI_PENYIMPANAN)
  } catch {
    return jsonCadangan
  }
}

function tulisJson(nilai: string): void {
  jsonCadangan = nilai
  const backend = cariBackend()
  if (!backend) return
  try {
    backend.setItem(KUNCI_PENYIMPANAN, nilai)
  } catch {
    // Penyimpanan penuh/di-blok — cadangan memori sudah terisi.
  }
}

function bacaAntre(): AntreKunjungan[] {
  try {
    const mentah = bacaJson()
    if (!mentah) return []
    const hasil = JSON.parse(mentah) as AntreKunjungan[]
    return Array.isArray(hasil) ? hasil : []
  } catch {
    return []
  }
}

function simpanAntre(daftar: AntreKunjungan[]): void {
  tulisJson(JSON.stringify(daftar))
}

const daftar = ref<AntreKunjungan[]>(bacaAntre())
const sedangSinkron = ref(false)
const daring = ref(typeof navigator === 'undefined' ? true : navigator.onLine)

const totalAntre = computed(() => daftar.value.length)
const totalGagal = computed(() => daftar.value.filter((d) => d.gagal).length)

function tulis(): void {
  simpanAntre(daftar.value)
}

export function tambahKeAntre(
  item: Omit<AntreKunjungan, 'uid' | 'dibuat' | 'gagal'>,
): void {
  daftar.value.push({
    ...item,
    uid:
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    dibuat: new Date().toISOString(),
  })
  tulis()
}

export function buangDariAntre(uid: string): void {
  daftar.value = daftar.value.filter((d) => d.uid !== uid)
  tulis()
}

export function buangSemuaGagal(): void {
  daftar.value = daftar.value.filter((d) => !d.gagal)
  tulis()
}

async function kirimSatu(item: AntreKunjungan): Promise<void> {
  if (item.modul === 'balita') {
    const b = await ambilBalita(item.identitasId)
    if (!b) throw new Error(`Data balita "${item.nama}" tidak ditemukan lagi.`)
    await tambahKunjungan(b, item.isi as unknown as InputKunjungan)
  } else if (item.modul === 'bumil') {
    const b = await ambilBumil(item.identitasId)
    if (!b) throw new Error(`Data ibu hamil "${item.nama}" tidak ditemukan lagi.`)
    await tambahKunjunganBumil(b, item.isi as unknown as InputKunjunganBumil)
  } else {
    const a = await ambilApras(item.identitasId)
    if (!a) throw new Error(`Data apras "${item.nama}" tidak ditemukan lagi.`)
    await tambahKunjunganApras(a, item.isi as unknown as InputKunjunganApras)
  }
}

// Proses antre secara FIFO. Berhenti begitu koneksi putus lagi (sisa tetap).
export async function sinkronkan(): Promise<{ terkirim: number; gagal: number }> {
  if (sedangSinkron.value || !daring.value) return { terkirim: 0, gagal: 0 }
  sedangSinkron.value = true
  let terkirim = 0
  let gagal = 0
  try {
    for (const item of [...daftar.value]) {
      if (item.gagal) continue
      try {
        await kirimSatu(item)
        buangDariAntre(item.uid)
        terkirim++
      } catch (e) {
        if (adalahGalatJaringan(e)) break
        // Objek di-share dengan state reaktif — cukup tandai lalu simpan.
        item.gagal = true
        tulis()
        gagal++
      }
    }
  } finally {
    sedangSinkron.value = false
  }
  return { terkirim, gagal }
}

// Reaksi otomatis terhadap status koneksi (aman dipanggil berkali-kali).
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    daring.value = true
    void sinkronkan()
  })
  window.addEventListener('offline', () => {
    daring.value = false
  })
}

// Ubah status koneksi secara eksplisit (dipakai pengujian; runtime asli
// mengandalkan event online/offline yang otomatis memicu sinkron).
export function setDaring(v: boolean): void {
  daring.value = v
}

export function useOfflineAntre() {
  return {
    daftar: readonly(daftar),
    daring: readonly(daring),
    sedangSinkron: readonly(sedangSinkron),
    totalAntre,
    totalGagal,
    sinkronkan,
  }
}
